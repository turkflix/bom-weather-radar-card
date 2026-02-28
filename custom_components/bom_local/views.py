import aiohttp
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from .const import DOMAIN

from homeassistant.helpers.aiohttp_client import async_get_clientsession

class BomLocalProxyView(HomeAssistantView):
    """Proxy view for BOM local service images."""
    url = "/api/bom_local/proxy/{path:.*}"
    name = "api:bom_local:proxy"
    requires_auth = False

    def __init__(self, service_url: str):
        self._service_url = service_url.rstrip('/')

    async def get(self, request, path):
        """Fetch image from local service and stream it back."""
        # Reconstruct query parameters (important for historical data)
        query_string = request.query_string
        target_url = f"{self._service_url}/{path}"
        if query_string:
            target_url = f"{target_url}?{query_string}"

        hass = request.app["hass"]
        session = async_get_clientsession(hass)
        try:
            async with session.get(target_url, timeout=15) as response:
                if response.status != 200:
                    return web.Response(status=response.status)
                
                content = await response.read()
                return web.Response(
                    body=content,
                    content_type=response.content_type,
                    headers={"Cache-Control": "max-age=3600"}
                )
        except Exception:
            return web.Response(status=502)

from aiohttp import web

