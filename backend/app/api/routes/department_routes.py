from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.department_schema import Department, DepartmentsResponse
from app.services.department_service import DepartmentService
from app.dependencies.db import get_department_service

router = APIRouter()


@router.get("/", response_model=DepartmentsResponse)
async def get_departments(
    department_service: DepartmentService = Depends(get_department_service),
):
    try:
        departments = await department_service.get_departments()
        return {"response": departments}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve departments: {str(e)}",
        )


@router.get("/{code}", response_model=Department)
async def get_department_by_code(
    code: str,
    department_service: DepartmentService = Depends(get_department_service),
):
    try:
        dept = await department_service.get_department_by_code(code)
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Department with code '{code}' not found",
            )
        return dept
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve department: {str(e)}",
        )
