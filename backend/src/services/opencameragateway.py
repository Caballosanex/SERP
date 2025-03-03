# Nokia API client configuration
import httpx

NOKIA_API_BASE_URL = "http://mock-nokia-api:6000/api/v1"


class EmergencyServiceError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code


async def nokia_api_call(method: str, endpoint: str, json=None):
    async with httpx.AsyncClient() as client:
        try:
            # Debug log
            print(
                f"Calling Nokia API: {method} {NOKIA_API_BASE_URL}/{endpoint}")
            response = await client.request(
                method,
                f"{NOKIA_API_BASE_URL}/{endpoint}",
                json=json,
                timeout=10.0
            )
            response.raise_for_status()
            # Si es una respuesta 204, no intentamos parsear JSON
            if response.status_code == 204:
                return None
            return response.json()
        except httpx.ReadTimeout:
            raise EmergencyServiceError("Nokia API timeout", 504)
        except httpx.HTTPError as e:
            raise EmergencyServiceError(f"Nokia API error: {str(e)}", 502)
        except Exception as e:
            raise EmergencyServiceError(f"Unexpected error: {str(e)}")