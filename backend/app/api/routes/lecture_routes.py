from fastapi import APIRouter, HTTPException
from datetime import datetime
from core.database import lectures_collection
from models.lecture import LectureCreate

router = APIRouter(prefix="/lectures", tags=["Lectures"])


@router.post("/")
async def create_lecture(lecture: LectureCreate):

    # Validate dates
    if lecture.end_time <= lecture.start_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time"
        )

    lecture_data = lecture.model_dump()

    lecture_data["created_at"] = datetime.utcnow()
    lecture_data["updated_at"] = datetime.utcnow()

    result = await lectures_collection.insert_one(
        lecture_data
    )

    return {
        "message": "Lecture created successfully",
        "lecture_id": str(result.inserted_id)
    }