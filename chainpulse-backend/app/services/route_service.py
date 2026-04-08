import httpx
import random
from typing import Any

from app.config import settings


class RouteService:
    """Service for fetching and managing delivery routes."""

    OPENROUTESERVICE_URL = "https://api.openrouteservice.org/v2/directions/driving-hcv"

    @staticmethod
    def _decode_polyline(encoded: str) -> list[list[float]]:
        """
        Decode Google's polyline encoding format.
        Reference: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
        """
        points = []
        index, lat, lng = 0, 0, 0

        while index < len(encoded):
            result = 0
            shift = 0
            while True:
                b = ord(encoded[index]) - 63
                index += 1
                result |= (b & 0x1f) << shift
                shift += 5
                if not (b & 0x20):
                    break
            dlat = ~(result >> 1) if (result & 1) else (result >> 1)
            lat += dlat

            result = 0
            shift = 0
            while True:
                b = ord(encoded[index]) - 63
                index += 1
                result |= (b & 0x1f) << shift
                shift += 5
                if not (b & 0x20):
                    break
            dlng = ~(result >> 1) if (result & 1) else (result >> 1)
            lng += dlng

            points.append([lat / 1e5, lng / 1e5])

        return points

    @staticmethod
    def _generate_mock_route(
        origin_lat: float, origin_lon: float, dest_lat: float, dest_lon: float
    ) -> list[list[float]]:
        """Generate a realistic curved path between origin and destination."""
        waypoints = [[origin_lat, origin_lon]]

        # Generate 5-8 intermediate waypoints with curved path
        num_points = random.randint(5, 8)
        for i in range(1, num_points + 1):
            t = i / (num_points + 1)

            # Linear interpolation
            lat = origin_lat + (dest_lat - origin_lat) * t
            lon = origin_lon + (dest_lon - origin_lon) * t

            # Add perpendicular deviation for curve effect
            # Perpendicular direction
            dx = dest_lon - origin_lon
            dy = dest_lat - origin_lat
            perp_lat = -dx
            perp_lon = dy

            # Normalize and scale
            length = (perp_lat**2 + perp_lon**2) ** 0.5
            if length > 0:
                perp_lat /= length
                perp_lon /= length

            # Parabolic interpolation (higher deviation at midpoint)
            deviation_factor = 4 * t * (1 - t)  # Max at t=0.5
            max_deviation = 0.8  # degrees

            lat += perp_lat * max_deviation * deviation_factor * random.uniform(-0.8, 0.8)
            lon += perp_lon * max_deviation * deviation_factor * random.uniform(-0.8, 0.8)

            waypoints.append([round(lat, 4), round(lon, 4)])

        waypoints.append([dest_lat, dest_lon])
        return waypoints

    @staticmethod
    def _calculate_distance(waypoints: list[list[float]]) -> float:
        """Approximate distance in km using haversine formula."""
        from math import radians, cos, sin, asin, sqrt

        def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
            c = 2 * asin(sqrt(a))
            return c * 6371  # Radius of earth in kilometers

        total_distance = 0.0
        for i in range(len(waypoints) - 1):
            lat1, lon1 = waypoints[i]
            lat2, lon2 = waypoints[i + 1]
            total_distance += haversine(lat1, lon1, lat2, lon2)

        return round(total_distance, 1)

    @staticmethod
    async def get_route(
        origin_lat: float, origin_lon: float, dest_lat: float, dest_lon: float
    ) -> dict[str, Any]:
        """
        Get a single route between origin and destination.

        Returns:
            Dict with waypoints, distance_km, duration_hours
        """
        api_key = settings.OPENROUTE_API_KEY

        # If no API key, return mock route
        if not api_key or api_key.strip() == "":
            waypoints = RouteService._generate_mock_route(origin_lat, origin_lon, dest_lat, dest_lon)
            distance_km = RouteService._calculate_distance(waypoints)
            # Estimate duration at average 60 km/h
            duration_hours = round(distance_km / 60, 2)
            return {"waypoints": waypoints, "distance_km": distance_km, "duration_hours": duration_hours}

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    RouteService.OPENROUTESERVICE_URL,
                    json={
                        "coordinates": [[origin_lon, origin_lat], [dest_lon, dest_lat]],
                        "format": "json",
                    },
                    headers={"Authorization": api_key},
                )
                response.raise_for_status()
                data = response.json()

                if "routes" not in data or len(data["routes"]) == 0:
                    # Fallback to mock if no route found
                    waypoints = RouteService._generate_mock_route(
                        origin_lat, origin_lon, dest_lat, dest_lon
                    )
                else:
                    route = data["routes"][0]

                    # Try to decode polyline, otherwise use summary waypoints
                    if "geometry" in route:
                        try:
                            waypoints = RouteService._decode_polyline(route["geometry"])
                        except Exception:
                            # If decode fails, generate mock
                            waypoints = RouteService._generate_mock_route(
                                origin_lat, origin_lon, dest_lat, dest_lon
                            )
                    else:
                        waypoints = RouteService._generate_mock_route(
                            origin_lat, origin_lon, dest_lat, dest_lon
                        )

                # Extract distance and duration
                distance_m = route.get("distance", 0)
                distance_km = round(distance_m / 1000, 1)
                duration_s = route.get("duration", 0)
                duration_hours = round(duration_s / 3600, 2)

                return {
                    "waypoints": waypoints,
                    "distance_km": distance_km,
                    "duration_hours": duration_hours,
                }

        except (httpx.RequestError, ValueError, KeyError):
            # Fall back to mock route on API failure
            waypoints = RouteService._generate_mock_route(origin_lat, origin_lon, dest_lat, dest_lon)
            distance_km = RouteService._calculate_distance(waypoints)
            duration_hours = round(distance_km / 60, 2)
            return {"waypoints": waypoints, "distance_km": distance_km, "duration_hours": duration_hours}

    @staticmethod
    async def get_alternate_routes(
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
        avoid_areas: list = None,
    ) -> list[dict[str, Any]]:
        """
        Get up to 3 alternate routes.

        Args:
            origin_lat, origin_lon: Starting coordinates
            dest_lat, dest_lon: Destination coordinates
            avoid_areas: Optional list of areas to avoid

        Returns:
            List of route dicts with waypoints, distance_km, duration_hours, risk_score
        """
        if avoid_areas is None:
            avoid_areas = []

        api_key = settings.OPENROUTE_API_KEY

        # Generate 3 mock routes with variations
        routes = []
        for i in range(3):
            # Add slight randomness to each route
            seed_val = random.randint(0, 1000000) + i * 1000
            random.seed(seed_val)

            waypoints = RouteService._generate_mock_route(origin_lat, origin_lon, dest_lat, dest_lon)
            distance_km = RouteService._calculate_distance(waypoints)

            # Randomize distance slightly (±10%)
            distance_km *= random.uniform(0.9, 1.1)
            distance_km = round(distance_km, 1)

            # Estimate duration at 60 km/h average
            duration_hours = round(distance_km / 60, 2)

            # Placeholder risk score (0.0 for now)
            risk_score = 0.0

            routes.append(
                {
                    "waypoints": waypoints,
                    "distance_km": distance_km,
                    "duration_hours": duration_hours,
                    "risk_score": risk_score,
                }
            )

        return routes


async def get_route_data(origin: str, destination: str) -> dict:
    """Legacy wrapper for backward compatibility."""
    service = RouteService()
    # Mock coordinates for legacy endpoint
    return {"origin": origin, "destination": destination, "eta_hours": None}
