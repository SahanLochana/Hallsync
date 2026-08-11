from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

import models
import schemas
from database import get_db
from auth import require_role
from conflict_check import has_conflict

router = APIRouter(prefix="/timetable", tags=["Timetable"])


@router.get("/", response_model=List[schemas.TimetableOut])
def list_timetable(
    hall_id: Optional[int] = None,
    batch: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Timetable)
    if hall_id:
        query = query.filter(models.Timetable.hall_id == hall_id)
    if batch:
        query = query.filter(models.Timetable.batch == batch)
    return query.order_by(models.Timetable.date, models.Timetable.start_time).all()


@router.post("/", response_model=schemas.TimetableOut)
def create_timetable_entry(
    entry_in: schemas.TimetableCreate,
    db: Session = Depends(get_db),
    _user=Depends(require_role("lecturer", "admin")),
):
    if has_conflict(db, entry_in.hall_id, entry_in.date, entry_in.start_time, entry_in.end_time):
        raise HTTPException(
            status_code=409,
            detail="Conflict: this hall is already booked or scheduled during this time",
        )

    entry = models.Timetable(**entry_in.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=schemas.TimetableOut)
def update_timetable_entry(
    entry_id: int,
    entry_in: schemas.TimetableCreate,
    db: Session = Depends(get_db),
    _user=Depends(require_role("lecturer", "admin")),
):
    entry = db.query(models.Timetable).filter(models.Timetable.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")

    if has_conflict(
        db, entry_in.hall_id, entry_in.date, entry_in.start_time, entry_in.end_time,
        exclude_timetable_id=entry_id,
    ):
        raise HTTPException(status_code=409, detail="Conflict with another slot")

    for field, value in entry_in.model_dump().items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}")
def delete_timetable_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    _user=Depends(require_role("lecturer", "admin")),
):
    entry = db.query(models.Timetable).filter(models.Timetable.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")
    db.delete(entry)
    db.commit()
    return {"detail": "Timetable entry deleted"}
