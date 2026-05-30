from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth
from app.core.database import client

app = FastAPI(title="University Portal Backend")

# Let your Flutter Emulator connect without restriction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Test MongoDB Connection instantly on startup
@app.on_event("startup")
async def startup_db_client():
    try:
        await client.admin.command('ping')
        
        print(" SUCCESS: FastAPI connected to MongoDB Cluster!")
        
    except Exception as e:
        
        print(f"DATABASE CONNECTION ERROR: {e}")
        

# Include the login routes
app.include_router(auth.router, prefix="/api/v1/auth")