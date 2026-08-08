from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.module_schema import (
    SemesterModules,
    SemesterModulesResponse,
    SemesterModulesCreate,
    SemesterModulesUpdate,
    ModuleItemCreate,
)
from app.services.module_service import ModuleService
from app.dependencies.db import get_module_service

router = APIRouter()


# ── Collection & Semester Endpoints ───────────────────────────────────────────


@router.get("", response_model=SemesterModulesResponse)
async def get_all_semesters(
    module_service: ModuleService = Depends(get_module_service),
):
    try:
        data = await module_service.get_all_semesters()
        return {"response": data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve semester modules: {str(e)}",
        )


@router.post("/", response_model=SemesterModules, status_code=status.HTTP_201_CREATED)
async def create_semester(
    payload: SemesterModulesCreate,
    module_service: ModuleService = Depends(get_module_service),
):
    try:
        existing = await module_service.get_semester(payload.semester)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Semester document '{payload.semester}' already exists",
            )
        return await module_service.create_semester(payload.model_dump())
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create semester modules: {str(e)}",
        )


@router.get("/{semester}", response_model=SemesterModules)
async def get_semester(
    semester: str,
    module_service: ModuleService = Depends(get_module_service),
):
    try:
        result = await module_service.get_semester(semester)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Semester '{semester}' not found",
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve semester '{semester}': {str(e)}",
        )


@router.put("/{semester}", response_model=SemesterModules)
async def update_semester(
    semester: str,
    update_data: SemesterModulesUpdate,
    module_service: ModuleService = Depends(get_module_service),
):
    try:
        updated = await module_service.update_semester(
            semester, update_data.model_dump()
        )
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Semester '{semester}' not found",
            )
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update semester '{semester}': {str(e)}",
        )


@router.delete("/{semester}", status_code=status.HTTP_200_OK)
async def delete_semester(
    semester: str,
    module_service: ModuleService = Depends(get_module_service),
):
    try:
        success = await module_service.delete_semester(semester)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Semester '{semester}' not found",
            )
        return {
            "status": "success",
            "message": f"Semester '{semester}' deleted successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete semester '{semester}': {str(e)}",
        )


# ── Individual Module Item Sub-Endpoints ──────────────────────────────────────


@router.post("/{semester}/items", response_model=SemesterModules)
async def add_module_item(
    semester: str,
    item: ModuleItemCreate,
    module_service: ModuleService = Depends(get_module_service),
):
    try:
        updated = await module_service.add_module_to_semester(
            semester, item.model_dump()
        )
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Semester '{semester}' not found",
            )
        return updated
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add module to semester '{semester}': {str(e)}",
        )


@router.delete("/{semester}/items/{module_id}", response_model=SemesterModules)
async def remove_module_item(
    semester: str,
    module_id: str,
    module_service: ModuleService = Depends(get_module_service),
):
    try:
        updated = await module_service.remove_module_from_semester(semester, module_id)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Semester '{semester}' not found",
            )
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove module '{module_id}' from semester '{semester}': {str(e)}",
        )
