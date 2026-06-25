from fastapi import FastAPI
from app.api.api import api_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Database

app = FastAPI(redirect_slashes=False)

origins = [
    "http://localhost:3000", "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.routes.auth import router as auth_router

app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/auth", tags=["Auth"])

@app.on_event("startup")
async def startup():
    db = Database()
    await db.create_index()

@app.get("/")
def home():
    return {"message": "HallSync API"}
