# Zuha Kanji — Portfolio

Personal site for Zuha Kanji, Senior Geotechnical Engineer at Larsen & Toubro (Renewables IC, Middle East projects) and researcher in geocell-reinforced foundations.

Plain static files: no build step, no framework, no server code.

## What's on the page

| Section | What it does |
| --- | --- |
| Hero | Animated footing-on-geocell drawing that assembles once on load |
| Profile | Summary and record of roles and qualifications |
| Current work | Interactive solar-pile cross-section: six hotspots (wind, pile, cemented layer, groundwater, load testing, resistivity) with keyboard arrow navigation |
| Research | Four research interests |
| Publications | Search, type filter, sort by year, copy APA or BibTeX. Press `/` anywhere to jump to search |
| 3D model | Three.js footing and geocell model, loaded only when scrolled near |
| Calculator | Live bearing capacity calculator with soil presets, term breakdown and a width-versus-capacity chart |
| Experience | Timeline, academic projects, grouped skills |
| Contact | Email, copy-email button, LinkedIn |

Also: light/dark theme (remembers the visitor's choice), gold reading-progress line under the header, borehole-log section rail on wide screens, reduced-motion support, print styles, a custom 404 page.

## Files

```
index.html            page content and metadata
styles.css            design tokens, layout, components, themes, print
script.js             all interactivity
404.html              "page not found" page
logo.svg / logo.png   header and footer logo
favicon.ico, favicon.svg, favicon-16x16.png, favicon-32x32.png
apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png
site.webmanifest      home-screen icon settings
og-image.png          1200 x 630 social-sharing preview
robots.txt, sitemap.xml
.nojekyll             tells GitHub Pages to serve files as-is
```

## Upload to GitHub

1. Unzip the download.
2. In the repository, choose **Add file → Upload files** and drag in everything inside the folder (including `.nojekyll`; on macOS press ⌘ + Shift + . to show hidden files).
3. Delete files from the old version that are no longer used: `logo-96.png`, `favicon-32.png`, `favicon.png`, `HOW-TO-USE.txt`.
4. Commit to the branch your host deploys from.

**Vercel:** nothing to change; it redeploys on commit. **GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root. For the custom domain, add `zuhakanji.in` under Settings → Pages → Custom domain.

Hard-refresh after deploying (Ctrl/⌘ + Shift + R). Favicons are cached for a while.

## Editing

- **Current work text:** the six explainer cards are in `PV_STEPS` in `script.js`; the scope list is in `index.html` under `id="work"`. These describe the typical geotechnical scope of utility-scale solar work, so trim anything that doesn't match the actual role.
- **Add a publication:** copy an `<article class="pub">` block. Set `data-year`, `data-type` (`journal` or `chapter`), `data-keywords`, and both `data-copy` citations (APA and BibTeX).
- **Calculator soil presets:** `PRESETS` in `script.js`.
- **3D views:** `VIEWS` in `script.js`.
- **Colours and type:** custom properties at the top of `styles.css`.
- **Domain:** `https://zuhakanji.in/` is set in `index.html` (canonical, Open Graph), `robots.txt` and `sitemap.xml`. Change all four if the domain changes.

## Integrity notes

- The 3D model and the solar-pile drawing are conceptual. Nothing on them is a design result.
- The calculator is for learning: general bearing capacity equation, vertical centric load, level ground, no settlement or reinforcement. The page says so.
- DOI and publisher links go to the publishers' pages; access is controlled by the publishers.
