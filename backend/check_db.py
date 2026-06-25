import asyncio
from pymongo import AsyncMongoClient

async def run():
    client = AsyncMongoClient("mongodb://localhost:27017")
    db = client["lecture_hall_db"]
    
    users = await db.users.find({}).to_list(100)
    print("USERS:")
    for u in users:
        print(f"Role: {u.get('role')} | Dept: {u.get('department')} | Email: {u.get('email')}")
        
    print("\nNOTIFICATIONS:")
    notifs = await db.notifications.find({}).to_list(100)
    for n in notifs:
        print(n)

    print("\nLECTURES:")
    lectures = await db.lectures.find({}).to_list(10)
    for l in lectures:
        print(f"Dept: {l.get('department')} | Lecturer: {l.get('lecturer_id')}")

asyncio.run(run())
