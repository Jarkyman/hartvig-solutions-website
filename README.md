# Hartvig Solutions

A modern, responsive portfolio site for Hartvig Solutions — showcasing apps and projects with clean UI, dynamic loading, and simple routing suitable for static hosting.

## Features

- **Responsive layout**: Works on desktop, tablet, and mobile
- **Clean UI**: Midnight Blue + Sky Cyan color scheme
- **Project pages**: Generated from `/project/<name>/info.json` folders
- **HTMX**: Lightweight interactivity without heavy frameworks
- **Privacy policies**: Markdown support per project
- **Static-host friendly**: Client-side router keeps URLs clean

## Project Structure

```
.
├─ index.html                 # Homepage (projects loaded + routing)
├─ styles.css                 # Global styles
├─ script.js                  # Main JS (navigation + carousels)
├─ project-styles.css         # Styles for project detail pages
├─ projects.json              # Optional project list (if desired)
├─ project/                   # All project folders live here
│  ├─ jsontomodel/
│  ├─ flags-game/
│  ├─ hint-master/
│  └─ util-master/
├─ tools/                     # Self-hosted utility pages (served via /tools/{name})
├─ assets/                    # Logos, tool images, etc.
├─ .htaccess                  # Clean URL handling on Apache
├─ PROJECT_SETUP.md           # Detailed setup + notes
└─ README.md                  # This file
```

## Development

- Open `index.html` directly or serve the folder with any static server.
- Ensure your host rewrites unknown routes to `index.html` (Netlify/Vercel do this automatically, Apache via `.htaccess`).

## Adding a Project

1. Create a folder under `project/` (e.g., `project/your-project/`).
2. Add `info.json` with metadata:

```
{
  "name": "Your Project Name",
  "description": "Detailed description",
  "appStore": "https://apps.apple.com/app/...",
  "googlePlay": "https://play.google.com/store/apps/details?id=...",
  "website": "https://example.com",
 "privacyPolicy": "privacy-policy.md",
  "imageCount": 3
}
```

3. Drop screenshots into `project/your-project/images/` (use names like `image1.png`, `image2.jpg`).
4. Update `PROJECTS_DATA` in `index.html` (or `projects.json` if you wire it up) so the project appears on the homepage.

## Adding a Personal Tool Page

1. Create a folder under `tools/` (e.g., `tools/golf-gps/`).
2. Add an `index.html` file (full standalone page). Inline CSS/JS is fine.
3. Navigate to `https://yourdomain.com/tools/golf-gps` and the router will embed it inside the site, plus provide an “Open in new tab” link.

You can pass query parameters and they’ll be forwarded to the iframe, so `?course=augusta` still works.

## Tech Stack

- **HTML/CSS/JS**: No framework; HTMX for interactivity
- **JSON**: Project metadata and lists

## Deployment

- Works on GitHub Pages, Netlify, Vercel (as a static site)
- For Apache hosts: upload the repository and keep `.htaccess` so `/project-name` URLs resolve to `index.html`

## Branch strategy

- `main`: Development branch (latest changes, not always stable)
- `prod`: Production branch (deployed to InfinityFree)

## License

All rights reserved — Hartvig Solutions, 2025
