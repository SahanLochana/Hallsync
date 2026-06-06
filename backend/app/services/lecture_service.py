# services/lecture_service.py

from datetime import datetime

async def create_lecture(db, lecture_data):
    lecture = {
        "title": lecture_data.title,
        "description": lecture_data.description,
        "course_id": lecture_data.course_id,
        "lecturer_id": lecture_data.lecturer_id,
        "created_at": datetime.utcnow()
    }

    result = await db.lectures.insert_one(lecture)

    lecture["_id"] = str(result.inserted_id)
    return lecture