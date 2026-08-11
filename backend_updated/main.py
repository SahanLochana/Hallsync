from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import users, halls, timetable, bookings, notifications

# Creates faculty.db and all tables automatically on first run
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Faculty Lecture Hall Management API")

# Allow the Flutter app to call this API from anywhere during development.
# Tighten this to your app's actual origin before any real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(halls.router)
app.include_router(timetable.router)
app.include_router(bookings.router)
app.include_router(notifications.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Faculty Lecture Hall Management API is running"}
