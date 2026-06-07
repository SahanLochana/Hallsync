from fastapi import FastAPI
from api.routes import router

app = FastAPI(redirect_slashes=False)

app.include_router(router)