import logging
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.const import CONF_URL
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN, CONF_SERVICE_URL, DEFAULT_SERVICE_URL

_LOGGER = logging.getLogger(__name__)

class BomLocalConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for BOM Local Radar."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        # Check if YAML configuration already exists by checking if component is loaded
        if DOMAIN in self.hass.config.components:
            return self.async_abort(reason="already_configured")
        
        errors = {}
        if user_input is not None:
            # We could validate the URL here by trying a fetch
            return self.async_create_entry(title="BOM Local Radar", data=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required(CONF_SERVICE_URL, default=DEFAULT_SERVICE_URL): str,
            }),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return BomLocalOptionsFlow(config_entry)

class BomLocalOptionsFlow(config_entries.OptionsFlow):
    """Handle options flow."""

    def __init__(self, config_entry):
        super().__init__(config_entry)

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({
                vol.Required(
                    CONF_SERVICE_URL,
                    default=self.config_entry.data.get(CONF_SERVICE_URL, DEFAULT_SERVICE_URL),
                ): str,
            }),
        )

