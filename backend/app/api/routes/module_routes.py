from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.module_schema import (
    Module,
    ModulesResponse,
    ModuleCreate,
    ModuleUpdate,
)
from app.services.module_service import ModuleService
from app.dependencies.db import get_module_service

router = APIRouter()


# ── Collection endpoints ───────────────────────────────────────────────────────


@router.get("", response_model=ModulesResponse)
async def get_modules(
    module_service: ModuleService = Depends(get_module_service),
):
    try:
        modules = await module_service.get_modules()
        return {"response": modules}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve modules: {str(e)}",
        )


@router.post("/", response_model=Module, status_code=status.HTTP_201_CREATED)
async def create_module(
    module: ModuleCreate,
    module_service: ModuleService = Depends(get_module_service),
):
    try:
        existing = await module_service.get_module(module.module_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Module with module_id '{module.module_id}' already exists",
            )
        return await module_service.create_module(module.model_dump())
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
            detail=f"Failed to create module: {str(e)}",
        )


# ── Single-module endpoints ────────────────────────────────────────────────────


@router.get("/{module_id}", response_model=Module)
async def get_module(
    module_id: str,
    module_service: ModuleService = Depends(get_module_service),
):
    try:
        module = await module_service.get_module(module_id)
        if not module:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Module '{module_id}' not found",
            )
        return module
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve module: {str(e)}",
        )


@router.put("/{module_id}", response_model=Module)
async def update_module(
    module_id: str,
    update_data: ModuleUpdate,
    module_service: ModuleService = Depends(get_module_service),
):
    try:
        update_dict = update_data.model_dump(exclude_unset=True)
        if not update_dict:
            existing = await module_service.get_module(module_id)
            if not existing:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Module '{module_id}' not found",
                )
            return existing

        updated = await module_service.update_module(module_id, update_dict)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Module '{module_id}' not found",
            )
        return updated
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update module: {str(e)}",
        )


@router.delete("/{module_id}", status_code=status.HTTP_200_OK)
async def delete_module(
    module_id: str,
    module_service: ModuleService = Depends(get_module_service),
):
    try:
        success = await module_service.delete_module(module_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Module '{module_id}' not found",
            )
        return {
            "status": "success",
            "message": f"Module '{module_id}' deleted successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete module: {str(e)}",
        )
