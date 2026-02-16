# mobile-device-frames

Wrap HTML prototypes in realistic device frames with navigation, responsive behavior, and safe areas. Uses Tailwind CSS (CDN). No build step required.

**[Live Demo](https://phucsystem.github.io/mobile-device-frames/)**

## Features

- 8 device frames (iPhone, Galaxy, Pixel) with accurate dimensions
- Portrait & landscape orientation with smooth animated transition
- Dynamic Island, Notch, and Punch Hole overlays
- Desktop sidebar + mobile FAB bottom sheet navigation
- Responsive: fullscreen on mobile, framed on desktop
- Safe area CSS utilities
- Staggered entrance animations
- Load any URL in an iframe inside the device frame
- Zero dependencies (Tailwind CDN optional)
- No build step — just HTML, CSS, JS

## Quick Start

```html
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="frame.css">
<script src="frame.js" defer></script>

<div data-device="iphone-16-pro">
  <!-- your app content -->
</div>
```

## Device Options

| ID | Device | Width | Height | Radius | Notch Type |
|----|--------|-------|--------|--------|------------|
| `iphone-16-pro-max` | iPhone 16 Pro Max | 430px | 932px | 55px | Dynamic Island |
| `iphone-16-pro` | iPhone 16 Pro | 393px | 852px | 55px | Dynamic Island |
| `iphone-16` | iPhone 16/15/14 | 390px | 844px | 47px | Notch |
| `iphone-se` | iPhone SE 3rd | 375px | 667px | 0px | None |
| `galaxy-s24-ultra` | Galaxy S24 Ultra | 412px | 915px | 48px | Punch Hole |
| `galaxy-s24` | Galaxy S24 | 360px | 780px | 42px | Punch Hole |
| `pixel-9-pro` | Pixel 9 Pro | 412px | 892px | 44px | Punch Hole |
| `pixel-9` | Pixel 9 | 393px | 851px | 42px | Punch Hole |

Default: `iphone-16-pro`

## Navigation Config

For multi-screen prototypes, define `window.DeviceFrameConfig` before loading `frame.js`:

```html
<script>
window.DeviceFrameConfig = {
  device: 'iphone-16-pro',
  title: 'My App v1.0',
  screens: [
    { group: 'Core', items: [
      { file: 'home.html', label: 'Home' },
      { file: 'settings.html', label: 'Settings' },
    ]},
    { group: 'Features', items: [
      { file: 'camera.html', label: 'Camera' },
    ]},
  ],
};
</script>
<script src="frame.js" defer></script>
```

- **Desktop (>768px)**: Fixed left sidebar with grouped links
- **Tablet (501-768px)**: Collapsible sidebar with hamburger toggle
- **Mobile (<500px)**: FAB button + bottom sheet overlay

## URL / Iframe Mode

Load any web URL inside the device frame:

```html
<!-- Via attribute -->
<div data-device="iphone-16-pro" data-url="https://example.com"></div>

<!-- Via config -->
<script>
window.DeviceFrameConfig = {
  device: 'galaxy-s24-ultra',
  url: 'https://example.com',
};
</script>
<div data-device="auto"></div>
```

Switch URLs at runtime:

```js
window.deviceFrame.loadUrl('https://example.com');
window.deviceFrame.loadUrl('');  // clear iframe, restore content
```

> **Note:** Some sites block iframe embedding via `X-Frame-Options` or `Content-Security-Policy`. An error message is shown when this happens. To bypass this during development, install the [Ignore X-Frame headers](https://chromewebstore.google.com/detail/ignore-x-frame-headers/gleekbfjekiniecknbkamfmkohkpodhe) Chrome extension — enable it only while testing, then disable it for normal browsing.

## Orientation

Default is portrait. Set landscape via attribute or config:

```html
<!-- Via attribute -->
<div data-device="iphone-16-pro" data-orientation="landscape"></div>

<!-- Via config -->
<script>
window.DeviceFrameConfig = {
  device: 'iphone-16-pro',
  orientation: 'landscape',
};
</script>
<div data-device="auto"></div>
```

Toggle at runtime:

```js
window.deviceFrame.setOrientation('landscape');
window.deviceFrame.setOrientation('portrait');
window.deviceFrame.toggleOrientation(); // returns new orientation
```

In landscape mode:
- Width and height are swapped
- Notch/Dynamic Island moves to the left edge
- Home indicator moves to the right edge
- Hardware buttons reposition to top/bottom
- Safe zone padding rotates accordingly
- Smooth CSS transition animates the change

## Safe Area Utilities

CSS classes for `env(safe-area-inset-*)`:

| Class | Property |
|-------|----------|
| `.pt-safe` | `padding-top: env(safe-area-inset-top)` |
| `.pb-safe` | `padding-bottom: env(safe-area-inset-bottom)` |
| `.pl-safe` | `padding-left: env(safe-area-inset-left)` |
| `.pr-safe` | `padding-right: env(safe-area-inset-right)` |
| `.mt-safe` | `margin-top: env(safe-area-inset-top)` |
| `.mb-safe` | `margin-bottom: env(safe-area-inset-bottom)` |

## Animations

Add `data-animate` to elements for staggered fade-in-up on page load:

```html
<div data-animate>First element</div>
<div data-animate>Second element (80ms delay)</div>
<div data-animate>Third element (160ms delay)</div>
```

Available keyframes: `df-fade-in`, `df-fade-in-up`, `df-scale-in`, `df-slide-up`

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 500px` | Fullscreen, no frame, FAB nav, safe areas active |
| `501-768px` | Shrunk sidebar (140px), hamburger toggle |
| `> 768px` | Full sidebar (180px), frame centered |

## JS API

```js
// Auto-initialized on DOMContentLoaded — accessible via:
window.deviceFrame

// Switch device at runtime
window.deviceFrame.switchDevice('galaxy-s24-ultra');

// Orientation
window.deviceFrame.setOrientation('landscape');
window.deviceFrame.toggleOrientation();

// Load a URL in iframe
window.deviceFrame.loadUrl('https://example.com');

// Clear iframe
window.deviceFrame.loadUrl('');

// Get all device specs
const devices = DeviceFrame.getDevices();

// Manual initialization
const frame = new DeviceFrame({
  device: 'pixel-9-pro',
  orientation: 'landscape',    // optional: default 'portrait'
  url: 'https://example.com',  // optional: load URL in iframe
  title: 'My Proto',
  screens: [...]
});
frame.init();
```

## Browser Support

- Chrome 80+
- Safari 14+
- Firefox 80+
- Edge 80+

## License

MIT
