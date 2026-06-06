from motor.motor_asyncio import AsyncIOMotorClient
import os

# MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient("mongodb://localhost:27017/")

db = client["lecture_hall_db"]

lectures_collection = db["lectures"]