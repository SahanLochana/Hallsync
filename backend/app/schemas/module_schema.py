from pydantic import BaseModel
from typing import Optional


class Module(BaseModel):
    """Full lecture module representation returned by the API."""

    module_id: str
    name: str


class ModulesResponse(BaseModel):
    response: list[Module]


class ModuleCreate(BaseModel):
    """Request body for creating a new lecture module."""

    module_id: str
    name: str


class ModuleUpdate(BaseModel):
    """Fields optional — only supplied fields are patched."""

    name: Optional[str] = None
