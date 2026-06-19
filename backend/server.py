from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from passlib.hash import bcrypt
import jwt
import os
import io
import logging
from pathlib import Path
import uuid
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
fs = AsyncIOMotorGridFSBucket(db)

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'fixiq_secret_key_2025')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION = timedelta(days=30)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password: str
    role: str = "citizen"  # citizen, fixer, admin
    fixPoints: int = 0
    reputation: int = 0
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "citizen"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    user: Dict[str, Any]

class Location(BaseModel):
    type: str = "Point"
    coordinates: List[float]  # [longitude, latitude]

class Issue(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    urgency: str
    status: str = "pending"  # pending, in_progress, resolved
    location: Location
    attachments: List[str] = []
    createdBy: str
    createdByName: Optional[str] = None
    assignedTo: Optional[str] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IssueCreate(BaseModel):
    title: str
    description: str
    location: Location

class IssueUpdate(BaseModel):
    status: Optional[str] = None
    assignedTo: Optional[str] = None

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    message: str
    type: str
    read: bool = False
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Department(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    contactEmail: str
    members: List[str] = []

# AI Service
class AIService:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')

    async def categorize_issue(self, title: str, description: str) -> Dict[str, str]:
        """Use GPT-5 to categorize and determine urgency"""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"categorize-{uuid.uuid4()}",
                system_message="You are an AI assistant for FixIQ. Analyze issue descriptions and return only a JSON object with 'category' and 'urgency' fields. Categories: lighting, garbage, plumbing, roads, electricity, water, infrastructure, safety, other. Urgency: low, medium, high, critical."
            ).with_model("openai", "gpt-5")

            message = UserMessage(
                text=f"Title: {title}\nDescription: {description}\n\nReturn ONLY a JSON object like: {{\"category\": \"...\", \"urgency\": \"...\"}}"
            )
            
            response = await chat.send_message(message)
            
            # Parse response
            import json
            response_text = response.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            result = json.loads(response_text.strip())
            return {
                "category": result.get("category", "other"),
                "urgency": result.get("urgency", "medium")
            }
        except Exception as e:
            logging.error(f"AI categorization error: {e}")
            return {"category": "other", "urgency": "medium"}

    async def detect_duplicate(self, title: str, description: str, existing_issues: List[Dict]) -> Optional[str]:
        """Detect if similar issue exists"""
        if not existing_issues:
            return None
        
        try:
            issues_text = "\n".join([f"ID: {issue['id']}, Title: {issue['title']}, Description: {issue['description'][:100]}" for issue in existing_issues[:10]])
            
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"duplicate-{uuid.uuid4()}",
                system_message="You are an AI assistant. Check if a new issue is duplicate of existing issues. Return ONLY the issue ID if duplicate found, or 'none' if no duplicate."
            ).with_model("openai", "gpt-5")

            message = UserMessage(
                text=f"New Issue:\nTitle: {title}\nDescription: {description}\n\nExisting Issues:\n{issues_text}\n\nIs this a duplicate? Return issue ID or 'none'."
            )
            
            response = await chat.send_message(message)
            result = response.strip().lower()
            return None if result == 'none' else result
        except Exception as e:
            logging.error(f"Duplicate detection error: {e}")
            return None

ai_service = AIService()

# Auth Helper Functions
async def hash_password(password: str) -> str:
    return bcrypt.hash(password)

async def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.verify(password, hashed)

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + JWT_EXPIRATION
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        
        user = await db.users.find_one({'id': user_id}, {'_id': 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth Routes
@api_router.post("/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserSignup):
    # Check if user exists
    existing_user = await db.users.find_one({'email': user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = await hash_password(user_data.password)
    
    # Create user
    user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        role=user_data.role
    )
    
    user_dict = user.model_dump()
    user_dict['createdAt'] = user_dict['createdAt'].isoformat()
    
    result = await db.users.insert_one(user_dict)
    
    # Create token
    token = create_token(user.id)
    
    # Get clean user dict for response (without MongoDB _id and password)
    response_user = {k: v for k, v in user_dict.items() if k not in ['password', '_id']}
    
    return TokenResponse(token=token, user=response_user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    # Find user
    user = await db.users.find_one({'email': login_data.email}, {'_id': 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not await verify_password(login_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    token = create_token(user['id'])
    
    # Remove password and _id from response
    response_user = {k: v for k, v in user.items() if k not in ['password', '_id']}
    
    return TokenResponse(token=token, user=response_user)

# Issue Routes
@api_router.post("/issues", response_model=Issue)
async def create_issue(
    title: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    files: List[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    # Upload files to GridFS
    attachment_ids = []
    if files:
        for file in files:
            contents = await file.read()
            file_id = await fs.upload_from_stream(
                file.filename,
                io.BytesIO(contents),
                metadata={'contentType': file.content_type}
            )
            attachment_ids.append(str(file_id))
    
    # AI categorization
    ai_result = await ai_service.categorize_issue(title, description)
    
    # Check for duplicates
    existing_issues = await db.issues.find({}, {'_id': 0}).to_list(100)
    duplicate_id = await ai_service.detect_duplicate(title, description, existing_issues)
    
    if duplicate_id:
        raise HTTPException(status_code=400, detail=f"Possible duplicate issue detected: {duplicate_id}")
    
    # Create issue
    issue = Issue(
        title=title,
        description=description,
        category=ai_result['category'],
        urgency=ai_result['urgency'],
        location=Location(coordinates=[longitude, latitude]),
        attachments=attachment_ids,
        createdBy=current_user['id'],
        createdByName=current_user['name']
    )
    
    issue_dict = issue.model_dump()
    issue_dict['createdAt'] = issue_dict['createdAt'].isoformat()
    issue_dict['updatedAt'] = issue_dict['updatedAt'].isoformat()
    
    await db.issues.insert_one(issue_dict)
    
    # Award points to user
    await db.users.update_one(
        {'id': current_user['id']},
        {'$inc': {'fixPoints': 10}}
    )
    
    return issue

@api_router.get("/issues", response_model=List[Issue])
async def get_issues(
    status: Optional[str] = None,
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if status:
        query['status'] = status
    if category:
        query['category'] = category
    
    issues = await db.issues.find(query, {'_id': 0}).sort('createdAt', -1).to_list(1000)
    
    # Convert datetime strings back to datetime
    for issue in issues:
        if isinstance(issue['createdAt'], str):
            issue['createdAt'] = datetime.fromisoformat(issue['createdAt'])
        if isinstance(issue['updatedAt'], str):
            issue['updatedAt'] = datetime.fromisoformat(issue['updatedAt'])
    
    return issues

@api_router.get("/issues/{issue_id}", response_model=Issue)
async def get_issue(
    issue_id: str,
    current_user: dict = Depends(get_current_user)
):
    issue = await db.issues.find_one({'id': issue_id}, {'_id': 0})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    if isinstance(issue['createdAt'], str):
        issue['createdAt'] = datetime.fromisoformat(issue['createdAt'])
    if isinstance(issue['updatedAt'], str):
        issue['updatedAt'] = datetime.fromisoformat(issue['updatedAt'])
    
    return issue

@api_router.patch("/issues/{issue_id}")
async def update_issue(
    issue_id: str,
    update_data: IssueUpdate,
    current_user: dict = Depends(get_current_user)
):
    # Check if issue exists
    issue = await db.issues.find_one({'id': issue_id})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    # Only admin or fixer can update
    if current_user['role'] not in ['admin', 'fixer']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict['updatedAt'] = datetime.now(timezone.utc).isoformat()
    
    if update_dict:
        await db.issues.update_one({'id': issue_id}, {'$set': update_dict})
        
        # Award reputation if issue resolved
        if update_data.status == 'resolved':
            await db.users.update_one(
                {'id': current_user['id']},
                {'$inc': {'reputation': 15}}
            )
            
            # Notify issue creator
            notification = Notification(
                userId=issue['createdBy'],
                message=f"Your issue '{issue['title']}' has been resolved!",
                type="resolution"
            )
            notif_dict = notification.model_dump()
            notif_dict['createdAt'] = notif_dict['createdAt'].isoformat()
            await db.notifications.insert_one(notif_dict)
    
    return {"message": "Issue updated successfully"}

@api_router.get("/issues/{issue_id}/attachment/{file_id}")
async def get_attachment(
    issue_id: str,
    file_id: str,
    current_user: dict = Depends(get_current_user)
):
    from fastapi.responses import StreamingResponse
    from bson import ObjectId
    
    try:
        grid_out = await fs.open_download_stream(ObjectId(file_id))
        contents = await grid_out.read()
        
        return StreamingResponse(
            io.BytesIO(contents),
            media_type=grid_out.metadata.get('contentType', 'application/octet-stream')
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail="File not found")

# Leaderboard
@api_router.get("/leaderboard")
async def get_leaderboard(current_user: dict = Depends(get_current_user)):
    users = await db.users.find({}, {'_id': 0, 'password': 0}).sort('fixPoints', -1).limit(20).to_list(20)
    return users

# Analytics
@api_router.get("/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    # Total issues
    total_issues = await db.issues.count_documents({})
    
    # Issues by status
    pending = await db.issues.count_documents({'status': 'pending'})
    in_progress = await db.issues.count_documents({'status': 'in_progress'})
    resolved = await db.issues.count_documents({'status': 'resolved'})
    
    # Issues by category
    categories = {}
    all_issues = await db.issues.find({}, {'_id': 0, 'category': 1}).to_list(10000)
    for issue in all_issues:
        cat = issue.get('category', 'other')
        categories[cat] = categories.get(cat, 0) + 1
    
    # Top locations (simplified)
    location_data = await db.issues.find({}, {'_id': 0, 'location': 1}).to_list(1000)
    
    return {
        'totalIssues': total_issues,
        'statusBreakdown': {
            'pending': pending,
            'in_progress': in_progress,
            'resolved': resolved
        },
        'categoryBreakdown': categories,
        'totalUsers': await db.users.count_documents({})
    }

# Notifications
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {'userId': current_user['id']},
        {'_id': 0}
    ).sort('createdAt', -1).limit(50).to_list(50)
    
    for notif in notifications:
        if isinstance(notif['createdAt'], str):
            notif['createdAt'] = datetime.fromisoformat(notif['createdAt'])
    
    return notifications

@api_router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    await db.notifications.update_one(
        {'id': notification_id, 'userId': current_user['id']},
        {'$set': {'read': True}}
    )
    return {"message": "Notification marked as read"}

# User Profile
@api_router.get("/users/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({'id': current_user['id']}, {'_id': 0, 'password': 0})
    return user

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()