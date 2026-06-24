import asyncio
from pymongo import AsyncMongoClient

async def test():
    client = AsyncMongoClient("mongodb://localhost:27017")
    db = client["lecture_hall_db"]
    cursor = db["lectures"].find()
    try:
        docs = await cursor.to_list()
        print(f"Docs: {len(docs)}")
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test())
