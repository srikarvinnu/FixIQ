from pymongo import MongoClient

uri = "mongodb+srv://srikarvinnu:Fixiq123@cluster0.mhvjyma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

try:
    client = MongoClient(uri)
    print(client.list_database_names())
    print("Connected Successfully")
except Exception as e:
    print("ERROR:")
    print(e)