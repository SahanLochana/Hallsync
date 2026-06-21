from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth

app = FastAPI(title="University Portal Backend")

# Let your Flutter Emulator connect without restriction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the login routes
app.include_router(auth.router, prefix="/api/v1")