from fastapi import FastAPI
from app.api.api import api_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import get_db

app = FastAPI()

origins = origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://hallsync.tech",
    "https://www.hallsync.tech",
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
    db = get_db()
    await db.create_index()


@app.get("/")
def home():
    return {"message": "HallSync API"}


@app.get("/health")
def health():
    return {"status": "ok"}
