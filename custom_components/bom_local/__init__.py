"""The BOM Local Radar integration."""
import logging
import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, CONF_SERVICE_URL, DEFAULT_SERVICE_URL
from .views import BomLocalProxyView
from .websocket import async_setup_websocket

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {
                vol.Required(CONF_SERVICE_URL, default=DEFAULT_SERVICE_URL): cv.string,
            }
        )
    },
    extra=vol.ALLOW_EXTRA,
)

async def async_setup(hass: HomeAssistant, config: dict):
    """Set up the BOM Local Radar component from YAML."""
    if DOMAIN not in config:
        return True

    conf = config[DOMAIN]
    service_url = conf.get(CONF_SERVICE_URL)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["service_url"] = service_url

    await _async_setup_integration(hass, service_url)

    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up BOM Local Radar from a config entry."""
    service_url = entry.data.get(CONF_SERVICE_URL)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["service_url"] = service_url

    await _async_setup_integration(hass, service_url)

    return True

async def _async_setup_integration(hass: HomeAssistant, service_url: str):
    """Common setup logic for YAML and Config Entry."""
    # Register the proxy view
    hass.http.register_view(BomLocalProxyView(service_url))

    # Register the websocket commands
    async_setup_websocket(hass, service_url)

    # Register the card as a resource automatically
    # Note: In a real HACS install, the path would be /local/community/bom-local-card/bom-local-card.js
    # but since this is an integration, it's /local/community/bom_local/bom-local-card.js
    await hass.http.async_register_static_paths([
        StaticPathConfig(
            "/local/community/bom_local/bom-local-card.js",
            hass.config.path("custom_components/bom_local/www/bom-local-card.js"),
            True
        ),
        StaticPathConfig(
            "/local/community/bom_local/icon.png",
            hass.config.path("custom_components/bom_local/icon.png"),
            True
        )
    ])

    _LOGGER.info("BOM Local Radar integration setup completed with service URL: %s", service_url)

