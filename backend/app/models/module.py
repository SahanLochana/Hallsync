from pydantic import BaseModel
from .common import MongoBaseModel


class ModuleItem(BaseModel):
    module_id: str
    name: str


class SemesterModules(MongoBaseModel):
    semester: str
    modules: list[ModuleItem] = []
