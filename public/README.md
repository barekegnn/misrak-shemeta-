# Misrak Shemeta Logo Setup

## Quick Start

1. **Save your logo image** from the screenshot as `logo.png` in this directory
2. The app will automatically use it!

## Required Files

Place these files in the `public/` directory:

### Essential Files
- `logo.png` - Main logo (512x512px recommended)
- `icon.png` - App icon for PWA (192x192px)
- `icon-512.png` - Large app icon (512x512px)
- `favicon.ico` - Browser tab icon (32x32px)
- `apple-touch-icon.png` - iOS home screen (180x180px)

### Optional Files
- `logo.svg` - Vector version for best quality

## How to Create Different Sizes

### Option 1: Online Tools (Easiest)
1. Go to https://www.iloveimg.com/resize-image
2. Upload your logo
3. Resize to each required size
4. Download and rename accordingly

### Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Then run these commands:

# Create icon sizes
convert logo.png -resize 192x192 icon.png
convert logo.png -resize 512x512 icon-512.png
convert logo.png -resize 180x180 apple-touch-icon.png
convert logo.png -resize 32x32 favicon.ico
```

### Option 3: Using Node.js Script
```bash
# Install sharp
npm install --save-dev sharp

# Run the conversion script (if created)
node scripts/generate-icons.js
```

## Current Status

✅ Code updated to use custom logo
✅ Metadata configured for PWA
✅ Fallback icons in place
⏳ Waiting for logo image files

## Where the Logo Appears

- 🏠 Home page hero section
- 🧭 Navigation bar (top left)
- 📱 PWA app icon (when installed)
- 🌐 Browser tab (favicon)
- 📲 iOS home screen
- 🔍 Search results and bookmarks

## Testing

After adding the logo files:
1. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. Check the home page - logo should appear
3. Check the navigation bar - logo should appear
4. Check browser tab - favicon should appear

## Troubleshooting

**Logo not showing?**
- Clear browser cache
- Check file names match exactly (case-sensitive)
- Verify files are in the `public/` directory
- Check browser console for errors

**Logo looks blurry?**
- Use higher resolution source image
- Ensure PNG format with transparency
- Use SVG for best quality

## Need Help?

The logo will automatically fall back to a styled icon if the image files are not found, so the app will work either way!
