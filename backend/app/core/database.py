import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import certifi 


load_dotenv()
MONGO_URL = os.getenv("MONGO_URL")


client = AsyncIOMotorClient(MONGO_URL, tlsCAFile=certifi.where())


db = client.university_db 


user_collection = db.users