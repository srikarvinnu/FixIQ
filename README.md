# FixIQ – AI-Powered Community Issue Resolution Platform

## Overview

FixIQ is a full-stack web application designed to help citizens report local community issues and track their resolution status. The platform enables users to submit complaints with location data and media attachments, while providing dashboards, analytics, and leaderboards to encourage community participation.

The goal is to bridge the gap between citizens and local authorities through a transparent and data-driven issue management system.

---

## Live Demo

Frontend: https://fix-iq.vercel.app

Backend API: https://fixiq-production-836c.up.railway.app/docs

---

## Features

### User Authentication

* Secure user registration and login
* JWT-based authentication
* Role-based access control

### Issue Reporting

* Report community issues
* Upload image attachments
* Automatic location capture using browser geolocation
* Manual coordinate entry support

### Dashboard

* View all reported issues
* Filter by status
* Filter by category
* Real-time issue tracking

### Issue Management

* View issue details
* Update issue status
* Assign issues to responsible authorities
* Track resolution progress

### Community Engagement

* Contributor leaderboard
* FixPoints reward system
* Reputation tracking

### Analytics

* Issue statistics
* Resolution tracking
* Community performance insights

---

## Tech Stack

### Frontend

* React.js
* React Router
* Axios
* Tailwind CSS
* Radix UI
* Lucide React

### Backend

* FastAPI
* Python
* JWT Authentication
* REST APIs

### Database

* MongoDB Atlas

### Deployment

* Frontend: Vercel
* Backend: Railway

---

## System Architecture

Citizen
↓
React Frontend (Vercel)
↓
FastAPI Backend (Railway)
↓
MongoDB Atlas

---

## API Endpoints

### Authentication

* POST /api/auth/signup
* POST /api/auth/login

### Issues

* POST /api/issues
* GET /api/issues
* GET /api/issues/{id}
* PATCH /api/issues/{id}

### Analytics

* GET /api/analytics

### Leaderboard

* GET /api/leaderboard

### Notifications

* GET /api/notifications

### User Profile

* GET /api/users/me

---

## Project Structure

```text
FixIQ/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   └── public/
│
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/srikarvinnu/FixIQ.git
cd FixIQ
```

### Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn server:app --reload
```

### Frontend Setup

```bash
cd frontend

npm install --legacy-peer-deps

npm start
```

---

## Environment Variables

### Backend

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=FixIQ
JWT_SECRET=your_secret_key
EMERGENT_LLM_KEY=your_api_key
```

### Frontend

```env
REACT_APP_BACKEND_URL=https://your-backend-url
```

---

## Future Enhancements

* AI-based issue categorization
* AI-generated issue summaries
* Real-time notifications
* Authority-specific dashboards
* Mobile application
* GIS-based heatmaps
* Advanced analytics
* AI-powered resolution recommendations

---

## Resume Highlights

* Developed a full-stack cloud-deployed web application using React, FastAPI, and MongoDB.
* Implemented JWT authentication and role-based access control.
* Built REST APIs for issue management, analytics, and user operations.
* Integrated geolocation and file upload capabilities.
* Deployed production-ready frontend and backend using Vercel and Railway.
* Designed a scalable architecture supporting community issue tracking and engagement.

---

## Author

Srikar Moraparaju

GitHub: https://github.com/srikarvinnu

LinkedIn: https://www.linkedin.com/in/moraparajusrikar/
