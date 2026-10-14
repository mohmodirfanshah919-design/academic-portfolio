# Zuha Kanji — Academic and Engineering Portfolio

A static, single-page portfolio. No build step, no framework, no server.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page content, metadata, import map for Three.js |
| `styles.css` | Design tokens, layout, components, light/dark themes, print styles |
| `script.js` | Theme, navigation, publication search/filter, copy buttons, lazy-loaded 3D model |
| `favicon.png` | 512 px logo (browser icon and source asset) |
| `favicon-32.png` | 32 px browser-tab icon |
| `apple-touch-icon.png` | 180 px home-screen icon for iOS |
| `logo-96.png` | Header logo |
| `og-image.png` | 1200 × 630 social-sharing preview |

## Deploy (GitHub + Vercel)

1. Extract the ZIP.
2. Open the `academic-portfolio` repository on GitHub and choose **Add file → Upload files**.
3. Upload all nine files above, replacing files with the same names.
4. Delete the old icon file if it exists (it was referenced as `favicon.png.png`). It is no longer used.
5. Commit to the branch connected to Vercel.
6. In Vercel, wait for the deployment to show **Ready**, then open the domain and hard-refresh (Ctrl/⌘ + Shift + R) so the new icons and styles load.

No Vercel settings need to change: the site is plain static files served from the repository root.

## After the first deploy: enable social previews

Social sites need absolute URLs, and the production domain isn't recorded in the project. In `index.html`, find the three commented lines near the top and replace `https://YOUR-DOMAIN` with the real domain, then remove the `<!--` and `-->` around each:

```html
<link rel="canonical" href="https://YOUR-DOMAIN/">
<meta property="og:url" content="https://YOUR-DOMAIN/">
<meta property="og:image" content="https://YOUR-DOMAIN/og-image.png">
```

## How it behaves

- **Themes:** follows the device's light/dark setting until the visitor uses the toggle; their choice is remembered in that browser.
- **3D model:** Three.js 0.160.0 is downloaded from jsDelivr only when the visitor scrolls near the model, so it doesn't slow the first load. Rendering pauses when the model is off-screen or the tab is hidden. If WebGL is unavailable or the library can't be downloaded, a static cross-section is shown with an explanation.
- **Page scrolling is never captured by the model.** Zoom uses the buttons, a pinch, or Ctrl + scroll.
- **Reduced motion:** with the system "reduce motion" setting on, the hero drawing appears without animation, smooth scrolling is off, and the model doesn't auto-rotate.
- **Without JavaScript** all content is still readable and the static cross-section is shown.
- **Opening `index.html` directly from disk works**, apart from the 3D model and fonts if you're offline.

## Editing content

- **Add a publication:** copy an `<article class="pub">` block in `index.html`. Set `data-type` to `journal` or `chapter`, add search terms to `data-keywords`, and update the `data-copy` citation text. The result count updates automatically.
- **Colours and type** are CSS custom properties at the top of `styles.css` (section 1).
- **3D views** (titles, descriptions, camera positions) are in the `VIEWS` object in `script.js`.

## Integrity notes

- The 3D scene is a conceptual visualisation. Sliders change the picture only; they don't calculate engineering results. This is stated on the page.
- DOI and publisher links open the publishers' pages. Access or purchase options are controlled by the publishers.
- No phone number, date of birth or portrait is included.
