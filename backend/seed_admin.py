from pymongo import MongoClient
from app.core.config import settings
from app.core.security import get_password_hash


def seed_admin():
    client = MongoClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    collection = db["admin"]

    admin_id = "admin"
    password = "adminfoc"
    hashed_pw = get_password_hash(password)

    # Insert or update admin document
    collection.update_one(
        {"_id": "admin_cred"},
        {
            "$set": {
                "admin_id": admin_id,
                "hashed_pw": hashed_pw,
            }
        },
        upsert=True,
    )
    print(f"Successfully seeded admin credentials into DB: admin_id='{admin_id}'")
    client.close()


if __name__ == "__main__":
    seed_admin()
