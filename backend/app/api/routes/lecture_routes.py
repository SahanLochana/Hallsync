# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime
# pyrefly: ignore [missing-import]
from bson import ObjectId
from app.core.database import lectures_collection
from app.schemas.lecture_schema import LectureCreate, AvailabilityCheck

router = APIRouter(prefix="/lectures", tags=["Lectures"])


@router.post("")
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

@router.get("")
async def get_lectures(
    lecturer_id: Optional[str] = None,
    department: Optional[str] = None,
    batch: Optional[str] = None
):
    query = {}
    if lecturer_id:
        query["lecturer_id"] = lecturer_id
    if department:
        query["department"] = department
    if batch:
        query["batch"] = batch
        
    cursor = lectures_collection.find(query)
    lectures = await cursor.to_list()
    
    # Convert ObjectId to string for JSON serialization
    for lecture in lectures:
        lecture["_id"] = str(lecture["_id"])
        
    return lectures

@router.post("/check-availability")
async def check_availability(check: AvailabilityCheck):
    # Find any lecture in the same hall that overlaps with the given time period
    overlap_query = {
        "hall_id": check.hall_id,
        "$or": [
            # 1. Existing lecture starts during the new time slot
            {"start_time": {"$gte": check.start_time, "$lt": check.end_time}},
            # 2. Existing lecture ends during the new time slot
            {"end_time": {"$gt": check.start_time, "$lte": check.end_time}},
            # 3. Existing lecture completely envelops the new time slot
            {"start_time": {"$lte": check.start_time}, "end_time": {"$gte": check.end_time}}
        ]
    }
    
    if check.exclude_lecture_id:
        try:
            overlap_query["_id"] = {"$ne": ObjectId(check.exclude_lecture_id)}
        except Exception:
            pass
            
    count = await lectures_collection.count_documents(overlap_query)
    is_available = count == 0
    
    return {
        "available": is_available,
        "conflict_count": count
    }

@router.put("/{lecture_id}")
async def update_lecture(lecture_id: str, lecture: LectureCreate):
    if lecture.end_time <= lecture.start_time:
        raise HTTPException(status_code=400, detail="End time must be after start time")
        
    try:
        obj_id = ObjectId(lecture_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid lecture ID format")
        
    lecture_data = lecture.model_dump()
    lecture_data["updated_at"] = datetime.utcnow()
    
    result = await lectures_collection.update_one(
        {"_id": obj_id},
        {"$set": lecture_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lecture not found")
        
    return {"message": "Lecture updated successfully"}

@router.delete("/{lecture_id}")
async def delete_lecture(lecture_id: str):
    try:
        obj_id = ObjectId(lecture_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid lecture ID format")
        
    result = await lectures_collection.delete_one({"_id": obj_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lecture not found")
        
    return {"message": "Lecture deleted successfully"}
