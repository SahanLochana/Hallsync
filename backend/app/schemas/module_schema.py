from pydantic import BaseModel
from typing import Optional


class ModuleItem(BaseModel):
    """Individual module representation within a semester."""

    module_id: str
    name: str


class SemesterModules(BaseModel):
    """Full representation of a semester and its modules returned by the API."""

    semester: str
    modules: list[ModuleItem] = []


class SemesterModulesResponse(BaseModel):
    response: list[SemesterModules]


class SemesterModulesCreate(BaseModel):
    """Request body for creating a new semester module list."""

    semester: str
    modules: list[ModuleItem] = []


class SemesterModulesUpdate(BaseModel):
    """Request body for replacing modules list for a semester."""

    modules: list[ModuleItem]


class ModuleItemCreate(BaseModel):
    """Request body for adding a single module to a semester."""

    module_id: str
    name: str
