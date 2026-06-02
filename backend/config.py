import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
IMAGEKIT_PRIVATE_KEY = os.getenv("OPENAI_API_KEY", "")
IMAGEKIT_PUBLIC_KEY = os.getenv("OPENAI_API_KEY", "")
IMAGEKIT_URL_ENDPOINT = os.getenv("OPENAI_API_KEY", "")

DATABASE_URL = "sqlite:///./thumbnailbuilder.db"