from app.core.database import db  

async def authenticate_user(username: str, password: str):
    # Search the 'users' collection for the matching username
    user = await db.users.find_one({"username": username})
    
    if not user:
        return None
        
    # Verify plain text password (or use hashing if implemented)
    if user["password"] != password:
        return None
        
    return user

async def update_user_password(username: str, new_password: str):
    # Update the user's password in the database
    result = await db.users.update_one(
        {"username": username},
        {"$set": {
            "password": new_password,
            "isFirstLogin": False
                  }}
    )
    return result.modified_count > 0