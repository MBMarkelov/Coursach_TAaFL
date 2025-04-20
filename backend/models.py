# backend/models.py
from pydantic import BaseModel

class RegexInput(BaseModel):
    regex: str