# Hartvig Solutions

A modern, responsive portfolio site for Hartvig Solutions — showcasing apps and projects with clean UI, dynamic loading, and simple routing suitable for static hosting.

## Features

- **Responsive layout**: Works on desktop, tablet, and mobile
- **Clean UI**: Midnight Blue + Sky Cyan color scheme
- **Project pages**: Generated from per‑project folders and JSON
- **HTMX**: Lightweight interactivity without heavy frameworks
- **Privacy policies**: Markdown support per project
- **Static‑host friendly**: Clean URLs with a simple PHP router

## Project Structure

```
.
├─ index.html                 # Homepage (projects loaded + routing)
├─ styles.css                 # Global styles
├─ script.js                  # Main JS (router + loaders)
├─ project-styles.css         # Per‑project styles
├─ project-script.js          # Per‑project JS helpers
├─ projects.json              # Project list (if used)
├─ project-template.html      # Starting point for new projects
├─ api/
│  └─ mapdata.php            # JSON wrapper for InfinityFree anti‑bot
├─ jsontomodel/               # Example project
│  ├─ index.html
│  ├─ info.json
│  └─ images/
├─ flags-game/                # Example project
├─ hint-master/               # Example project
├─ util-master/               # Example project
├─ router.php                 # Simple PHP router for clean URLs
├─ .htaccess                  # Clean URL handling on Apache
├─ PROJECT_SETUP.md           # Detailed setup and backlog notes
└─ README.md                  # This file
```

## Development

- Open `index.html` directly or serve the folder with any static server.
- For clean URLs locally, use `php -S localhost:8080 router.php` or host on Apache with `.htaccess`.
- If hosting on InfinityFree, fetch JSON via `api/mapdata.php` to bypass anti‑bot protections.

## Adding a Project

1) Create a folder: `your-project/`
2) Copy `project-template.html` to `your-project/index.html`
3) Add `your-project/info.json` with metadata like:

```
{
  "name": "Your Project Name",
  "description": "Detailed description",
  "appStore": "https://apps.apple.com/app/...",
  "googlePlay": "https://play.google.com/store/apps/details?id=...",
  "website": "https://example.com",
  "privacyPolicy": "Markdown or text here"
}
```

Add any screenshots under `your-project/images/` — the gallery loads them automatically if referenced.

## Tech Stack

- **HTML/CSS/JS**: No framework; HTMX for interactivity
- **PHP (optional)**: `router.php` for clean URLs, `api/mapdata.php` for JSON proxying
- **JSON**: Project metadata and lists

## Deployment

- Works on GitHub Pages, Netlify, Vercel (as static site)
- For Apache/PHP hosts (e.g., InfinityFree): upload the repository and ensure `.htaccess` and `router.php` are enabled

## License

All rights reserved — Hartvig Solutions, 2025