from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_db
from auth import require_role

router = APIRouter(prefix="/halls", tags=["Halls"])


@router.get("/", response_model=List[schemas.HallOut])
def list_halls(db: Session = Depends(get_db)):
    return db.query(models.Hall).all()


@router.get("/{hall_id}", response_model=schemas.HallOut)
def get_hall(hall_id: int, db: Session = Depends(get_db)):
    hall = db.query(models.Hall).filter(models.Hall.id == hall_id).first()
    if not hall:
        raise HTTPException(status_code=404, detail="Hall not found")
    return hall


@router.post("/", response_model=schemas.HallOut)
def create_hall(
    hall_in: schemas.HallCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_role("admin")),
):
    hall = models.Hall(**hall_in.model_dump())
    db.add(hall)
    db.commit()
    db.refresh(hall)
    return hall


@router.delete("/{hall_id}")
def delete_hall(
    hall_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_role("admin")),
):
    hall = db.query(models.Hall).filter(models.Hall.id == hall_id).first()
    if not hall:
        raise HTTPException(status_code=404, detail="Hall not found")
    db.delete(hall)
    db.commit()
    return {"detail": "Hall deleted"}
