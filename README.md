# WiFi QR Code Generator

A progressive web app that generates QR codes for WiFi network access. Users can input their WiFi SSID, password, and encryption type to create a scannable QR code for instant connection.

## Features

- **QR Code Generation** — Enter SSID, password, and encryption type to generate a WiFi QR code
- **Download** — Save generated QR codes as PNG images
- **History (IndexedDB)** — Automatically saves networks locally; tap any saved entry to regenerate its QR code
- **PWA Support** — Installable as a standalone app with full offline support via Service Worker
- **Mobile Responsive** — Optimized for phones, tablets, and desktops with safe-area support
- **Password Toggle** — Show/hide password visibility
- **Special Character Handling** — Properly escapes `;` `:` `,` `\` `"` in SSID and passwords
- **Modern UI** — Card-based layout with CSS custom properties, smooth animations, and autofill styling fix

## Tech Stack

- HTML5
- CSS3 (CSS Variables, Flexbox, Media Queries)
- JavaScript (ES6+)
- [QRCode.js](https://github.com/davidshimjs/qrcodejs) — QR code generation
- IndexedDB — Client-side storage
- Service Worker — Offline caching

## Project Structure

```
├── index.html              # Main HTML
├── css/
│   └── style.css           # Styles with CSS variables
├── js/
│   ├── qrcode.min.js       # QRCode.js library
│   ├── db.js               # IndexedDB storage module
│   └── app.js              # Application logic
├── icons/
│   ├── icon.svg            # App icon (SVG)
│   └── generate-icons.html # PNG icon generator tool
├── manifest.json           # PWA manifest
└── sw.js                   # Service Worker
```

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern browser, or serve via any static file server
3. For PWA features (install prompt, offline), serve over HTTPS or `localhost`

### Generating PNG Icons

1. Open `icons/generate-icons.html` in a browser
2. Click the download links to save `icon-192.png` and `icon-512.png`
3. Place them in the `icons/` directory

## Usage

1. Enter your WiFi network name (SSID)
2. Enter the password
3. Select the security type (WPA/WPA2/WPA3, WEP, or Open)
4. Tap **Generate QR Code**
5. Scan the QR code with any mobile device to connect
6. Tap **Download QR Code** to save as PNG
7. Previously generated networks appear in **History** — tap to regenerate

## Demo

### Codepen
https://codepen.io/yapweijun1996/pen/GRVNbbo

## License

This project uses [QRCode.js](https://github.com/davidshimjs/qrcodejs) (MIT License).
