from app.core.database import Database
from app.core.security import verify_password
from typing import Optional, Dict, Any


class AdminService:
    def __init__(self, db: Database):
        self.collection = db.get_collection("admin")

    async def authenticate_admin(
        self, admin_id: str, password: str
    ) -> Optional[Dict[str, Any]]:
        # Admin credentials document is stored in 'admin' collection with _id="admin_cred" or matching admin_id
        cred_doc = await self.collection.find_one({"admin_id": admin_id})
        if not cred_doc:
            # Fallback check by _id if needed
            cred_doc = await self.collection.find_one({"_id": "admin_cred"})

        if not cred_doc:
            return None

        if cred_doc.get("admin_id") != admin_id:
            return None

        hashed_pw = cred_doc.get("hashed_pw", "")
        if verify_password(password, hashed_pw):
            return cred_doc

        return None
