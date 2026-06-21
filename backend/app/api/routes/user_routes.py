from fastapi import APIRouter, HTTPException, status
from app.schemas.user_schema import (
    User,
    UsersResponse,
    UserUpdate,
    BulkUserRequest,
    BulkImportResponse,
    BulkImportSummary,
    BulkFailedEntry,
)
from app.services.user_service import UserService

router = APIRouter()


# ── Collection endpoints ───────────────────────────────────────────────────────

@router.get("/", response_model=UsersResponse)
async def get_users():
    user_service = UserService()
    try:
        users = await user_service.get_users()
        return {"response": users}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve users: {str(e)}",
        )


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: User):
    user_service = UserService()
    try:
        existing = await user_service.get_user(user.universityId)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with universityId '{user.universityId}' already exists",
            )
        return await user_service.create_user(user.model_dump())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}",
        )


# ── Bulk import ────────────────────────────────────────────────────────────────

@router.post("/bulk", response_model=BulkImportResponse, status_code=status.HTTP_200_OK)
async def bulk_create_users(body: BulkUserRequest):
    """
    Accept a list of users and attempt to create all of them.
    Returns success/failed arrays and a summary — no streaming.
    """
    user_service = UserService()
    try:
        result = await user_service.bulk_create_users(
            [u.model_dump() for u in body.users]
        )
        return BulkImportResponse(
            success=result["success"],
            failed=[BulkFailedEntry(**f) for f in result["failed"]],
            summary=BulkImportSummary(
                total=len(body.users),
                succeeded=len(result["success"]),
                failed=len(result["failed"]),
            ),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk import failed: {str(e)}",
        )


# ── Single-user endpoints (path param must come last to avoid swallowing /bulk) ──
# NOTE: {university_id:path} captures slashes so IDs like "SE/2021/001" work.

@router.get("/{university_id:path}", response_model=User)
async def get_user(university_id: str):
    user_service = UserService()
    try:
        user = await user_service.get_user(university_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with universityId '{university_id}' not found",
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user: {str(e)}",
        )


@router.put("/{university_id:path}", response_model=User)
async def update_user(university_id: str, update_data: UserUpdate):
    user_service = UserService()
    try:
        update_dict = update_data.model_dump(exclude_unset=True)
        if not update_dict:
            existing_user = await user_service.get_user(university_id)
            if not existing_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"User with universityId '{university_id}' not found",
                )
            return existing_user

        updated_user = await user_service.update_user(university_id, update_dict)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with universityId '{university_id}' not found",
            )
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}",
        )


@router.delete("/{university_id:path}", status_code=status.HTTP_200_OK)
async def delete_user(university_id: str):
    user_service = UserService()
    try:
        success = await user_service.delete_user(university_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with universityId '{university_id}' not found",
            )
        return {"status": "success", "message": f"User '{university_id}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}",
        )
