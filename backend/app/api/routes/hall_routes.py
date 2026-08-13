from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.hall_schema import (
    Hall,
    HallsResponse,
    HallCreate,
    HallUpdate,
)
from app.services.hall_service import HallService
from app.dependencies.db import get_hall_service
from typing import Optional

router = APIRouter()


# ── Collection endpoints ───────────────────────────────────────────────────────


@router.get("/", response_model=HallsResponse)
async def get_halls(
    search: Optional[str] = None,
    available_only: Optional[bool] = None,
    min_capacity: Optional[int] = None,
    amenity: Optional[str] = None,
    hall_service: HallService = Depends(get_hall_service),
):
    try:
        halls = await hall_service.get_halls_with_status(
            search=search,
            available_only=available_only,
            min_capacity=min_capacity,
            amenity=amenity,
        )
        return {"response": halls}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve halls: {str(e)}",
        )


@router.get("/with-status", response_model=HallsResponse)
async def get_halls_with_status(
    search: Optional[str] = None,
    available_only: Optional[bool] = None,
    min_capacity: Optional[int] = None,
    amenity: Optional[str] = None,
    hall_service: HallService = Depends(get_hall_service),
):
    try:
        halls = await hall_service.get_halls_with_status(
            search=search,
            available_only=available_only,
            min_capacity=min_capacity,
            amenity=amenity,
        )
        return {"response": halls}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve halls status: {str(e)}",
        )


@router.get("/{hall_id}/schedule")
async def get_hall_schedule(
    hall_id: str,
    hall_service: HallService = Depends(get_hall_service),
):
    try:
        schedule = await hall_service.get_hall_schedule(hall_id)
        return {"response": schedule}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve hall schedule: {str(e)}",
        )


@router.post("/", response_model=Hall, status_code=status.HTTP_201_CREATED)
async def create_hall(
    hall: HallCreate,
    hall_service: HallService = Depends(get_hall_service),
):
    try:
        existing = await hall_service.get_hall(hall.hallId)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Hall with hallId '{hall.hallId}' already exists",
            )
        return await hall_service.create_hall(hall.model_dump())
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create hall: {str(e)}",
        )


# ── Single-hall endpoints ──────────────────────────────────────────────────────


@router.get("/{hall_id}", response_model=Hall)
async def get_hall(
    hall_id: str,
    hall_service: HallService = Depends(get_hall_service),
):
    try:
        hall = await hall_service.get_hall(hall_id)
        if not hall:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hall '{hall_id}' not found",
            )
        return hall
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve hall: {str(e)}",
        )


@router.put("/{hall_id}", response_model=Hall)
async def update_hall(
    hall_id: str,
    update_data: HallUpdate,
    hall_service: HallService = Depends(get_hall_service),
):
    try:
        update_dict = update_data.model_dump(exclude_unset=True)
        if not update_dict:
            existing = await hall_service.get_hall(hall_id)
            if not existing:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Hall '{hall_id}' not found",
                )
            return existing

        updated = await hall_service.update_hall(hall_id, update_dict)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hall '{hall_id}' not found",
            )
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update hall: {str(e)}",
        )


@router.delete("/{hall_id}", status_code=status.HTTP_200_OK)
async def delete_hall(
    hall_id: str,
    hall_service: HallService = Depends(get_hall_service),
):
    try:
        success = await hall_service.delete_hall(hall_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hall '{hall_id}' not found",
            )
        return {
            "status": "success",
            "message": f"Hall '{hall_id}' deleted successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete hall: {str(e)}",
        )
