from .common import MongoBaseModel


class Module(MongoBaseModel):
    module_id: str
    name: str
