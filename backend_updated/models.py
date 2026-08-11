from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "student" | "lecturer" | "admin"

    bookings = relationship("Booking", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class Hall(Base):
    __tablename__ = "halls"

    id = Column(Integer, primary_key=True, index=True)
    hall_code = Column(String, nullable=False)       # e.g. "LH-101"
    hall_name = Column(String, nullable=False)        # e.g. "Lecture Hall A"
    building = Column(String, nullable=False)         # e.g. "Computing Building A"
    capacity = Column(Integer, nullable=False)
    floor = Column(Integer, default=1)
    seating_arrangements = Column(Integer, default=0)
    is_available = Column(String, default="true")     # "true" / "false" (kept as string for simplicity)
    facilities = Column(String, default="")            # comma-separated, e.g. "wifi,projector,ac"
    address = Column(String, nullable=True)
    latitude = Column(String, nullable=True)
    longitude = Column(String, nullable=True)

    timetable_entries = relationship("Timetable", back_populates="hall")
    bookings = relationship("Booking", back_populates="hall")


class Timetable(Base):
    __tablename__ = "timetable"

    id = Column(Integer, primary_key=True, index=True)
    hall_id = Column(Integer, ForeignKey("halls.id"), nullable=False)
    lecturer_name = Column(String, nullable=False)
    module = Column(String, nullable=False)
    batch = Column(String, nullable=True)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    hall = relationship("Hall", back_populates="timetable_entries")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hall_id = Column(Integer, ForeignKey("halls.id"), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    purpose = Column(String, nullable=True)
    status = Column(String, default="pending")  # "pending" | "approved" | "rejected"

    user = relationship("User", back_populates="bookings")
    hall = relationship("Hall", back_populates="bookings")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
