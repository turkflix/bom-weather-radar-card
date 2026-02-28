import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
import aiohttp
import logging

from homeassistant.helpers.aiohttp_client import async_get_clientsession
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

@callback
def async_setup_websocket(hass: HomeAssistant, service_url: str):
    """Set up websocket commands."""
    websocket_api.async_register_command(
        hass, websocket_get_radar_data
    )

@websocket_api.websocket_command({
    vol.Required("type"): "bom_local/get_radar_data",
    vol.Required("suburb"): str,
    vol.Required("state"): str,
    vol.Optional("timespan"): str,
    vol.Optional("startTime"): str,
    vol.Optional("endTime"): str,
})
@websocket_api.async_response
async def websocket_get_radar_data(hass: HomeAssistant, connection, msg):
    """Handle getting radar data."""
    service_url = hass.data[DOMAIN]["service_url"].rstrip('/')
    suburb = msg["suburb"]
    state = msg["state"]
    
    # Construct target URL for the local service
    if "startTime" in msg and "endTime" in msg:
        # Historical/Timeseries
        path = f"api/radar/{suburb}/{state}/timeseries?startTime={msg['startTime']}&endTime={msg['endTime']}"
    else:
        # Latest
        path = f"api/radar/{suburb}/{state}"
        
    target_url = f"{service_url}/{path}"
    
    session = async_get_clientsession(hass)
    try:
        async with session.get(target_url, timeout=10) as response:
            # Even if status is not 200 (e.g. 404), the service returns helpful JSON 
            # about cache status that the card needs.
            data = await response.json()
            
            if response.status == 200:
                connection.send_result(msg["id"], data)
            else:
                # Send the data back but as an error result so the card can parse it
                connection.send_result(msg["id"], data)
    except Exception as err:
        _LOGGER.error("Error fetching radar data from %s: %s", target_url, err)
        connection.send_error(msg["id"], "connection_error", str(err))

