from fastapi import APIRouter, HTTPException, status
from app.schemas.user_schema import User, UsersResponse, UserUpdate
from app.services.user_service import UserService

router = APIRouter()


@router.get("/", response_model=UsersResponse)
async def get_users():
    user_service = UserService()
    try:
        users = await user_service.get_users()
        return {"response": users}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve users: {str(e)}"
        )


@router.get("/{uid}", response_model=User)
async def get_user(uid: str):
    user_service = UserService()
    try:
        user = await user_service.get_user(uid)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with uid {uid} not found"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user: {str(e)}"
        )


@router.put("/{uid}", response_model=User)
async def update_user(uid: str, update_data: UserUpdate):
    user_service = UserService()
    try:
        # Exclude unset fields from the update payload
        update_dict = update_data.model_dump(exclude_unset=True)
        if not update_dict:
            existing_user = await user_service.get_user(uid)
            if not existing_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"User with uid {uid} not found"
                )
            return existing_user
        
        updated_user = await user_service.update_user(uid, update_dict)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with uid {uid} not found"
            )
        return updated_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )


@router.delete("/{uid}", status_code=status.HTTP_200_OK)
async def delete_user(uid: str):
    user_service = UserService()
    try:
        success = await user_service.delete_user(uid)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with uid {uid} not found"
            )
        return {"status": "success", "message": f"User with uid {uid} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )

