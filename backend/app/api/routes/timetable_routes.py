from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_timetables():
    return {"message": "Timetables"}

