from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from bson import ObjectId

class MongoBaseModel(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
