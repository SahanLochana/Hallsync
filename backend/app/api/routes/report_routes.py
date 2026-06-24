from fastapi import APIRouter, HTTPException, status
from app.schemas.report_schema import ReportCreate, ReportResponse
from app.core.database import reports_collection
from datetime import datetime
import uuid

router = APIRouter()

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(report: ReportCreate):
    report_dict = report.model_dump()
    # MongoDB doesn't automatically create string IDs like we want here, so we generate a uuid or use ObjectId
    report_dict["_id"] = str(uuid.uuid4())
    
    result = await reports_collection.insert_one(report_dict)
    
    if result.inserted_id:
        report_dict["id"] = report_dict.pop("_id")
        return ReportResponse(**report_dict)
    
    raise HTTPException(status_code=500, detail="Failed to create report")
