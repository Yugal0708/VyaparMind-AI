from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router

app = FastAPI(title="VyaparMind AI Backend")

# CORS Middleware setup taaki frontend se requests allow ho sake
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router for all endpoints under /api
app.include_router(api_router, prefix="/api")

# Root endpoint for health check
@app.get("/")
def read_root():
    return {"status": "VyaparMind Backend is 100% LIVE and Ready!"}