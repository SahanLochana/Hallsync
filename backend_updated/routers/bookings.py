from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_db
from auth import get_current_user, require_role
from conflict_check import has_conflict

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("/", response_model=List[schemas.BookingOut])
def list_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Admins see everything, everyone else sees only their own bookings
    if current_user.role == "admin":
        return db.query(models.Booking).all()
    return db.query(models.Booking).filter(models.Booking.user_id == current_user.id).all()


@router.post("/", response_model=schemas.BookingOut)
def create_booking(
    booking_in: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if has_conflict(db, booking_in.hall_id, booking_in.date, booking_in.start_time, booking_in.end_time):
        raise HTTPException(
            status_code=409,
            detail="Conflict: this hall is already booked or scheduled during this time",
        )

    booking = models.Booking(
        user_id=current_user.id,
        status="pending",
        **booking_in.model_dump(),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.put("/{booking_id}/status", response_model=schemas.BookingOut)
def update_booking_status(
    booking_id: int,
    status: str,
    db: Session = Depends(get_db),
    _admin=Depends(require_role("admin")),
):
    if status not in ("approved", "rejected", "pending"):
        raise HTTPException(status_code=400, detail="status must be approved, rejected, or pending")

    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = status
    db.add(models.Notification(
        user_id=booking.user_id,
        message=f"Your hall booking for {booking.date} was {status}.",
    ))
    db.commit()
    db.refresh(booking)
    return booking


@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your booking")

    db.delete(booking)
    db.commit()
    return {"detail": "Booking cancelled"}
