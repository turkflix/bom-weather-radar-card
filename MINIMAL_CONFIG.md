# 🎯 Minimal Radar Display - Clean Map Only

For a **clean radar display with just the map** and no controls/metadata:

## 📋 Minimal Configuration

```yaml
type: custom:bom-weather-radar-card
suburb: ashburton
state: VIC
service_url: http://192.168.86.62:8082
card_title: ""
show_metadata: false
auto_play: true
frame_interval: 2
display:
  show_controls: false
  show_frame_info: false
  show_loading: false
controls:
  position: hidden
metadata:
  position: hidden
```

## 🎨 Ultra-Minimal (No Header)

```yaml
type: custom:bom-weather-radar-card
suburb: ashburton
state: VIC
service_url: http://192.168.86.62:8082
card_title: ""
show_metadata: false
auto_play: true
frame_interval: 2
refresh_interval: 300
display:
  show_controls: false
  show_frame_info: false
  show_loading: false
  show_title: false
controls:
  position: hidden
metadata:
  position: hidden
style: |
  ha-card {
    box-shadow: none !important;
    border: none !important;
  }
  .card-header {
    display: none !important;
  }
```

## 🖼️ Result
- ✅ **Just the radar image**
- ✅ **Auto-playing slideshow** 
- ✅ **No controls visible**
- ✅ **No metadata**
- ✅ **No frame info**
- ✅ **Clean minimal display**

The radar will auto-play through frames every 2 seconds and refresh data every 5 minutes.