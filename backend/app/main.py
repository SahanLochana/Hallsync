from fastapi import FastAPI
from app.api.api import api_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Database
from app.repositories.hall_repo import HallRepo

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.on_event("startup")
async def startup():
    db = Database()
    await db.create_index()
    hall_repo = HallRepo()
    await hall_repo.create_index()


@app.get("/")
def home():
    return {"message": "HallSync API"}
