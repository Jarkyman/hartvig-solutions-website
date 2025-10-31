# How to Add New Projects

## Quick Setup

To add a new project, you only need to:

1. **Create a project folder** (e.g., `my-new-project/`)
2. **Add `info.json`** with project details
3. **Add images** (optional) to `images/` folder
4. **Add to `projects.json`** for homepage listing

## Example Project Structure

```
my-new-project/
├── info.json           # Your project details
└── images/             # Optional: project screenshots
    ├── screenshot1.jpg
    ├── screenshot2.jpg
    ├── screenshot3.jpg
    ├── image1.png
    └── image2.webp
```

## Image Support

The system automatically detects and displays images from the `images/` folder. 

### Recommended Approach (imageCount)
Add `imageCount` to your `info.json` file to specify exactly how many images to load:
```json
{
    "name": "Your Project",
    "description": "...",
    "imageCount": 3
}
```

**Naming Convention**: Use `image1.jpg`, `image2.png`, `image3.webp`, etc.
- **Extensions**: jpg, jpeg, png, gif, webp
- **Numbers**: 1 to the number specified in `imageCount`
- **Examples**: image1.jpg, image2.png, image3.webp

### Fallback Method
If no `imageCount` is specified, the system will try to find images with common names:
- **Names**: screenshot, image, photo, pic, img, app, demo, preview
- **Numbers**: 1-10 or just the name
- **Examples**: screenshot1.jpg, image.png, photo2.webp

**Loading**: Images are loaded lazily for better performance

### Gallery Features
- **Swipe Navigation**: Swipe left/right on mobile or drag with mouse on desktop
- **Navigation Buttons**: Click the arrow buttons to navigate
- **Indicators**: Click the dots at the bottom to jump to specific images
- **Counter**: Shows current image position (e.g., "2 / 5")
- **Responsive**: Works on all devices with touch and mouse support

### URL Parameters
- **Privacy Policy**: Add `?privacypolicy=true` to any project URL to open privacy policy directly
- **Examples**: 
  - `#flags-game?privacypolicy=true` - Opens Flags Game with privacy policy visible
  - `#hint-master?privacypolicy=true` - Opens Hint Master with privacy policy visible
- **Auto-update**: URL updates automatically when privacy policy is toggled

### Special Routes
- **App Ads.txt**: Access via `/project-name/app-ads.txt` or `#project-name/app-ads.txt`
  - Displays the project-specific app-ads.txt file content in a readable format
  - Used for ad network authorization in mobile apps
  - Falls back to 404 if file doesn't exist
  - Example: `#flags-game/app-ads.txt` shows Flags Game's app-ads.txt

## info.json Template

```json
{
  "name": "Your Project Name",
  "description": "Detailed description of your project...",
  "appStore": "https://apps.apple.com/app/your-app",
  "googlePlay": "https://play.google.com/store/apps/details?id=your.app",
  "website": "https://yourwebsite.com",
  "imageCount": 3,
  "privacyPolicy": "project-name/privacy-policy.md"
}
```

## Privacy Policy

Each project can have its own `privacy-policy.md` file. To add privacy policy to a project:

1. **Create file**: Add `privacy-policy.md` in the project folder
2. **Add reference**: Set `"privacyPolicy": "project-name/privacy-policy.md"` in the project's `info.json`
3. **No privacy policy**: Omit the `privacyPolicy` field entirely to hide the privacy policy button

### Example Structure:
```
project-name/
├── info.json
├── privacy-policy.md
├── app-ads.txt
└── images/
    ├── image1.jpg
    └── image2.png
```

## Optional Fields

- `appStore` - iOS App Store link
- `googlePlay` - Google Play Store link  
- `website` - Project website link
- `imageCount` - Number of images to load (1-10)
- `privacyPolicy` - Reference to privacy policy file

## Adding to Homepage

Update `projects.json` to include your new project:

```json
{
  "name": "my-new-project",
  "description": "Short description for homepage",
  "shortDescription": "Brief description"
}
```

## How It Works

- All projects use the same `dynamic-project.html` file
- Project content is automatically loaded from each project's `info.json`
- Images are automatically loaded from each project's `images/` folder
- URLs will be: `yoursite.com/project-name` (clean URLs)
- The system automatically detects the project name from the URL

## Server Configuration

This project includes multiple solutions for clean URLs:

### For Production Hosting (Apache/Nginx)
- Use the `.htaccess` file for Apache
- Use the `nginx.conf` example for Nginx

### For Local Development
- The JavaScript-based solution works on any server
- No server configuration needed
- Works with Live Server, XAMPP, etc.

### How It Works
- JavaScript detects project URLs and redirects to `dynamic-project.html`
- Works on all servers including local development servers
- Fallback to 404 page for unknown projects

That's it! Your project will automatically appear on the homepage and have its own page. 