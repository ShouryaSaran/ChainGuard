import httpx
from typing import Any

# Open-Meteo weather code descriptions
WEATHER_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}

# Weather codes considered severe (will trigger has_severe_weather flag)
SEVERE_WEATHER_CODES = {61, 63, 65, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99}


class WeatherService:
    """Service for fetching weather data from Open-Meteo API."""

    OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

    @staticmethod
    def _sample_waypoints(waypoints: list[tuple[float, float]], num_samples: int = 5) -> list[tuple[float, float]]:
        """Sample evenly spaced waypoints along a route."""
        if len(waypoints) <= num_samples:
            return waypoints

        step = len(waypoints) / (num_samples + 1)
        sampled = []
        for i in range(1, num_samples + 1):
            index = int(i * step)
            if index < len(waypoints):
                sampled.append(waypoints[index])
        return sampled

    @staticmethod
    def _get_weather_description(code: int) -> str:
        """Convert WMO weather code to human readable string."""
        return WEATHER_CODE_MAP.get(code, f"Unknown condition (code {code})")

    @staticmethod
    async def get_weather_for_route(waypoints: list[tuple[float, float]]) -> dict[str, Any]:
        """
        Fetch aggregated weather data for a route.

        Args:
            waypoints: List of (latitude, longitude) tuples

        Returns:
            Dict with aggregated weather metrics and conditions
        """
        if not waypoints:
            return {
                "max_wind_speed_kmh": 0.0,
                "total_precipitation_mm": 0.0,
                "min_visibility_km": 10.0,
                "weather_code": 0,
                "has_severe_weather": False,
                "conditions": ["No data"],
            }

        # Sample waypoints
        sampled = WeatherService._sample_waypoints(waypoints)

        # Aggregation variables
        max_wind = 0.0
        total_precip = 0.0
        min_visibility = 10.0
        worst_weather_code = 0
        weather_codes_seen = set()

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                for lat, lon in sampled:
                    try:
                        response = await client.get(
                            WeatherService.OPEN_METEO_URL,
                            params={
                                "latitude": lat,
                                "longitude": lon,
                                "current": "weather_code,wind_speed_10m,precipitation,visibility",
                                "timezone": "auto",
                            },
                        )
                        response.raise_for_status()
                        data = response.json()

                        if "current" in data:
                            current = data["current"]

                            # Extract values with defaults
                            wind = float(current.get("wind_speed_10m", 0.0))
                            precip = float(current.get("precipitation", 0.0))
                            visibility = float(current.get("visibility", 10000.0)) / 1000  # Convert to km
                            weather_code = int(current.get("weather_code", 0))

                            # Aggregate worst-case values
                            max_wind = max(max_wind, wind)
                            total_precip += precip
                            min_visibility = min(min_visibility, max(0.1, visibility))
                            weather_codes_seen.add(weather_code)

                            # Track worst weather code (higher values are generally worse)
                            if weather_code > worst_weather_code:
                                worst_weather_code = weather_code

                    except (httpx.RequestError, ValueError, KeyError):
                        # Continue with other waypoints if one fails
                        continue

        except httpx.RequestError:
            # Return safe defaults if API is completely unavailable
            return {
                "max_wind_speed_kmh": 0.0,
                "total_precipitation_mm": 0.0,
                "min_visibility_km": 10.0,
                "weather_code": 0,
                "has_severe_weather": False,
                "conditions": ["Weather data unavailable"],
            }

        # Generate conditions list
        conditions = []
        for code in sorted(weather_codes_seen):
            desc = WeatherService._get_weather_description(code)
            if desc not in conditions:
                conditions.append(desc)

        # If no conditions found, use worst code
        if not conditions:
            conditions = [WeatherService._get_weather_description(worst_weather_code)]

        # Check if severe weather
        has_severe = any(code in SEVERE_WEATHER_CODES for code in weather_codes_seen)

        return {
            "max_wind_speed_kmh": round(max_wind, 1),
            "total_precipitation_mm": round(total_precip, 1),
            "min_visibility_km": round(min_visibility, 1),
            "weather_code": worst_weather_code,
            "has_severe_weather": has_severe,
            "conditions": conditions[:3],  # Limit to top 3 conditions
        }


async def get_weather_for_route(origin: str, destination: str) -> dict:
    """Legacy wrapper for backward compatibility."""
    service = WeatherService()
    # For now return empty since we don't have waypoints from just city names
    return await service.get_weather_for_route([])
