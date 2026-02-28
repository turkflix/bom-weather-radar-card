# BOM Weather Radar Card 

🌦️ **A Home Assistant custom card for displaying Australian Bureau of Meteorology (BOM) rain radar data**

**This is the FIXED version** that properly calls the BOM Local Service API with correct URL format.

## ✅ What's Fixed

- **Correct API format:** `/api/radar/melbourne/vic` (suburb/state)  
- **No more 404 errors** from wrong URL formatting
- **Clean HACS installation** without caching issues
- **Works with BOM Local Service** v1.0.0-original and later

## 🚀 Quick Start

### Prerequisites

1. **BOM Local Service** running (Docker container)
2. **HACS** installed in Home Assistant

### Installation

1. **Add to HACS:**
   - HACS → Frontend → ⋮ → Custom repositories
   - Repository: `turkflix/bom-weather-radar-card`
   - Category: Frontend
   - Click "Install"

2. **Add to Dashboard:**
   ```yaml
   type: custom:bom-weather-radar-card
   suburb: melbourne
   state: VIC
   service_url: http://YOUR_SERVICE_IP:8082
   card_title: Local Weather Radar
   show_metadata: true
   timespan: latest
   frame_interval: 2
   auto_play: true
   refresh_interval: 30
   ```

## 📊 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `suburb` | string | **Required** | Suburb name (e.g., "melbourne") |
| `state` | string | **Required** | State abbreviation (e.g., "VIC") |
| `service_url` | string | **Required** | BOM Local Service URL |
| `card_title` | string | `"BOM Radar"` | Card header title |
| `show_metadata` | boolean | `true` | Show weather station info |
| `timespan` | string | `"latest"` | Time range (`latest`, `1h`, `3h`, `6h`, `12h`, `24h`, `custom`) |
| `frame_interval` | number | `2.0` | Seconds between frames in slideshow |
| `auto_play` | boolean | `true` | Start slideshow automatically |
| `refresh_interval` | number | `30` | Minutes between data refreshes |

## 🔧 BOM Local Service Setup

This card requires a **BOM Local Service** backend:

```yaml
# docker-compose.yml
services:
  bom-local-service:
    image: ghcr.io/turkflix/bom-local-service:v1.0.0-original
    container_name: bom-local-service
    ports:
      - "8082:8080"
    volumes:
      - ./cache:/app/cache
    environment:
      - CORS__ALLOWEDORIGINS=*
    restart: unless-stopped
```

## 🆚 Difference from Original

This is a **fixed version** of the original `bom-local-card` that:

- ✅ **Uses correct API format:** `suburb/state` not `state/suburb`
- ✅ **No HACS caching issues:** Completely new repository
- ✅ **Works immediately:** No manual file replacement needed
- ✅ **Clean installation:** Remove old card, install this one

## 🐛 Troubleshooting

### Card shows "HTTP 404: Not Found"
- Check service is running: `http://YOUR_IP:8082/health`
- Verify service URL in card config
- Ensure suburb/state are spelled correctly

### No radar images appear
- Check browser console (F12) for errors
- Verify service has data: `http://YOUR_IP:8082/api/radar/melbourne/vic`
- Clear browser cache and refresh

### Service timeout errors
- Check service logs for scraping errors
- Try different suburb (e.g., `richmond` instead of `melbourne`)
- Clear service cache folder

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🙏 Credits

Based on original work by Alex Hope-O'Connor.  
Fixed and maintained by turkflix.