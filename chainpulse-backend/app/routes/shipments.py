import random
import string
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import exists, select

from app.database import AsyncSessionLocal, Shipment, get_db
from app.models.schemas import ShipmentCreate, ShipmentResponse


router = APIRouter()


class StatusUpdate(BaseModel):
    status: str | None = None
    current_lat: float | None = None
    current_lon: float | None = None
    risk_score: float | None = None


def _generate_tracking_id() -> str:
    """Generate a tracking ID like CP-123456"""
    random_digits = "".join(random.choices(string.digits, k=6))
    return f"CP-{random_digits}"


def _generate_route_waypoints(
    origin_lat: float, origin_lon: float, dest_lat: float, dest_lon: float
) -> list[list[float]]:
    """Generate a route with interpolated waypoints between origin and destination."""
    waypoints = [[origin_lat, origin_lon]]

    # Generate 3-5 intermediate waypoints
    num_waypoints = random.randint(3, 5)
    for i in range(1, num_waypoints + 1):
        t = i / (num_waypoints + 1)
        lat = origin_lat + (dest_lat - origin_lat) * t
        lon = origin_lon + (dest_lon - origin_lon) * t
        # Add small random deviation for realism
        lat += random.uniform(-0.5, 0.5)
        lon += random.uniform(-0.5, 0.5)
        waypoints.append([round(lat, 4), round(lon, 4)])

    waypoints.append([dest_lat, dest_lon])
    return waypoints


async def seed_database() -> None:
    """Seed database with 5 sample shipments if table is empty."""
    async with AsyncSessionLocal() as db:
        # Check if shipments exist
        result = await db.execute(select(exists(select(Shipment))))
        shipments_exist = result.scalar()
        if shipments_exist:
            return

        sample_shipments = [
            Shipment(
                tracking_id=_generate_tracking_id(),
                origin="Shanghai",
                destination="Rotterdam",
                origin_lat=31.2304,
                origin_lon=121.4737,
                dest_lat=51.9225,
                dest_lon=4.4792,
                cargo_type="electronics",
                status="in_transit",
                current_lat=35.5,
                current_lon=50.0,
                risk_score=0.15,
                route_distance_km=11000.0,
                eta=datetime.utcnow() + timedelta(days=15),
            ),
            Shipment(
                tracking_id=_generate_tracking_id(),
                origin="Singapore",
                destination="Los Angeles",
                origin_lat=1.3521,
                origin_lon=103.8198,
                dest_lat=34.0522,
                dest_lon=-118.2437,
                cargo_type="general",
                status="in_transit",
                current_lat=15.0,
                current_lon=120.0,
                risk_score=0.22,
                route_distance_km=13600.0,
                eta=datetime.utcnow() + timedelta(days=12),
            ),
            Shipment(
                tracking_id=_generate_tracking_id(),
                origin="Hong Kong",
                destination="Hamburg",
                origin_lat=22.3193,
                origin_lon=114.1694,
                dest_lat=53.5511,
                dest_lon=9.9937,
                cargo_type="perishable",
                status="delayed",
                current_lat=40.0,
                current_lon=60.0,
                risk_score=0.45,
                route_distance_km=11900.0,
                eta=datetime.utcnow() + timedelta(days=18),
            ),
            Shipment(
                tracking_id=_generate_tracking_id(),
                origin="Dubai",
                destination="New York",
                origin_lat=25.2048,
                origin_lon=55.2708,
                dest_lat=40.7128,
                dest_lon=-74.0060,
                cargo_type="hazmat",
                status="at_risk",
                current_lat=30.0,
                current_lon=20.0,
                risk_score=0.68,
                route_distance_km=8200.0,
                eta=datetime.utcnow() + timedelta(days=10),
            ),
            Shipment(
                tracking_id=_generate_tracking_id(),
                origin="Sydney",
                destination="Singapore",
                origin_lat=-33.8688,
                origin_lon=151.2093,
                dest_lat=1.3521,
                dest_lon=103.8198,
                cargo_type="general",
                status="delivered",
                current_lat=1.3521,
                current_lon=103.8198,
                risk_score=0.05,
                route_distance_km=6300.0,
                eta=datetime.utcnow() + timedelta(days=1),
            ),
        ]

        db.add_all(sample_shipments)
        await db.commit()


@router.get("", response_model=list[ShipmentResponse])
async def list_shipments(db=Depends(get_db)):
    """Get all shipments with their current risk scores."""
    result = await db.execute(select(Shipment))
    shipments = result.scalars().all()
    return shipments


@router.post("", response_model=ShipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_shipment(payload: ShipmentCreate, db=Depends(get_db)):
    """Create a new shipment with auto-generated tracking ID."""
    shipment = Shipment(tracking_id=_generate_tracking_id(), **payload.model_dump())
    db.add(shipment)
    await db.commit()
    await db.refresh(shipment)
    return shipment


@router.get("/{tracking_id}", response_model=ShipmentResponse)
async def get_shipment(tracking_id: str, db=Depends(get_db)):
    """Get shipment details by tracking ID."""
    result = await db.execute(select(Shipment).where(Shipment.tracking_id == tracking_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")
    return shipment


@router.put("/{tracking_id}/status", response_model=ShipmentResponse)
async def update_shipment_status(tracking_id: str, payload: StatusUpdate, db=Depends(get_db)):
    """Update shipment status and current position."""
    result = await db.execute(select(Shipment).where(Shipment.tracking_id == tracking_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")

    if payload.status is not None:
        shipment.status = payload.status
    if payload.current_lat is not None:
        shipment.current_lat = payload.current_lat
    if payload.current_lon is not None:
        shipment.current_lon = payload.current_lon
    if payload.risk_score is not None:
        shipment.risk_score = payload.risk_score

    await db.commit()
    await db.refresh(shipment)
    return shipment


@router.delete("/{tracking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shipment(tracking_id: str, db=Depends(get_db)):
    """Delete a shipment."""
    result = await db.execute(select(Shipment).where(Shipment.tracking_id == tracking_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")

    db.delete(shipment)
    await db.commit()


@router.get("/{tracking_id}/route")
async def get_shipment_route(tracking_id: str, db=Depends(get_db)):
    """Get route information with current, alternate, and recommended routes."""
    result = await db.execute(select(Shipment).where(Shipment.tracking_id == tracking_id))
    shipment = result.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shipment not found")

    # Generate current route
    current_route = _generate_route_waypoints(
        shipment.origin_lat, shipment.origin_lon, shipment.dest_lat, shipment.dest_lon
    )

    # Generate 2 alternate routes with slight variations
    alternate_routes = [
        _generate_route_waypoints(
            shipment.origin_lat, shipment.origin_lon, shipment.dest_lat, shipment.dest_lon
        )
        for _ in range(2)
    ]

    return {"current_route": current_route, "alternate_routes": alternate_routes, "recommended": 0}
