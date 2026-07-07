from fastapi import APIRouter, HTTPException, status
from app.schemas.timetable_schema import (
    TimetableCreate,
    TimetableUpdate,
    TimetableResponse,
    TimetablesListResponse,
)
from app.services.timetable_service import TimetableService

router = APIRouter()


@router.get("/", response_model=TimetablesListResponse)
async def get_timetables():
    timetable_service = TimetableService()
    try:
        timetables = await timetable_service.get_timetables()
        return {"response": timetables}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve timetables: {str(e)}",
        )


@router.post("/", response_model=TimetableResponse, status_code=status.HTTP_201_CREATED)
async def create_timetable(timetable: TimetableCreate):
    timetable_service = TimetableService()
    try:
        return await timetable_service.create_timetable(timetable.model_dump())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create timetable: {str(e)}",
        )


@router.get("/{timetable_id}", response_model=TimetableResponse)
async def get_timetable(timetable_id: str):
    timetable_service = TimetableService()
    try:
        timetable = await timetable_service.get_timetable(timetable_id)
        if not timetable:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Timetable with ID '{timetable_id}' not found",
            )
        return timetable
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve timetable: {str(e)}",
        )


@router.put("/{timetable_id}", response_model=TimetableResponse)
async def update_timetable(timetable_id: str, update_data: TimetableUpdate):
    timetable_service = TimetableService()
    try:
        update_dict = update_data.model_dump(exclude_unset=True)
        if not update_dict:
            existing = await timetable_service.get_timetable(timetable_id)
            if not existing:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Timetable with ID '{timetable_id}' not found",
                )
            return existing

        updated = await timetable_service.update_timetable(timetable_id, update_dict)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Timetable with ID '{timetable_id}' not found",
            )
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update timetable: {str(e)}",
        )


@router.delete("/{timetable_id}", status_code=status.HTTP_200_OK)
async def delete_timetable(timetable_id: str):
    timetable_service = TimetableService()
    try:
        deleted = await timetable_service.delete_timetable(timetable_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Timetable with ID '{timetable_id}' not found",
            )
        return {"message": "Timetable deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete timetable: {str(e)}",
        )
