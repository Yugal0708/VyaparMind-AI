import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
load_dotenv() 

class Settings(BaseSettings):
    PROJECT_NAME: str = "VyaparMind AI"
    DEBUG: bool = True
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 
    FIREBASE_CREDENTIALS: str = "firebase/serviceAccountKey.json"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

