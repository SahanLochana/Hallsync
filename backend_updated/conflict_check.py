from datetime import date, time
from sqlalchemy.orm import Session

import models


def times_overlap(start_a: time, end_a: time, start_b: time, end_b: time) -> bool:
    return start_a < end_b and start_b < end_a


def has_conflict(
    db: Session,
    hall_id: int,
    on_date: date,
    start_time: time,
    end_time: time,
    exclude_booking_id: int | None = None,
    exclude_timetable_id: int | None = None,
) -> bool:
    """
    Checks BOTH the timetable and existing (approved/pending) bookings for the
    same hall + date, and returns True if the new slot overlaps an existing one.
    This is what the proposal calls the app's conflict-warning feature.
    """
    timetable_query = db.query(models.Timetable).filter(
        models.Timetable.hall_id == hall_id,
        models.Timetable.date == on_date,
    )
    if exclude_timetable_id:
        timetable_query = timetable_query.filter(models.Timetable.id != exclude_timetable_id)

    for entry in timetable_query.all():
        if times_overlap(start_time, end_time, entry.start_time, entry.end_time):
            return True

    booking_query = db.query(models.Booking).filter(
        models.Booking.hall_id == hall_id,
        models.Booking.date == on_date,
        models.Booking.status != "rejected",
    )
    if exclude_booking_id:
        booking_query = booking_query.filter(models.Booking.id != exclude_booking_id)

    for entry in booking_query.all():
        if times_overlap(start_time, end_time, entry.start_time, entry.end_time):
            return True

    return False
