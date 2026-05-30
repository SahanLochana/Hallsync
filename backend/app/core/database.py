from motor.motor_asyncio import AsyncIOMotorClient
import certifi 


MONGO_URL = "mongodb+srv://Ashvi:ashvi123@cluster0.loxjrj4.mongodb.net/?appName=Cluster0"

client = AsyncIOMotorClient(MONGO_URL, tlsCAFile=certifi.where())


db = client.university_db 


user_collection = db.users