from fastapi import APIRouter

from app.models.schemas import AlertResponse


router = APIRouter()


@router.get("", response_model=list[AlertResponse])
async def list_alerts() -> list[AlertResponse]:
    return []
