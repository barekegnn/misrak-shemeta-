/**
 * Icon Generator Script
 * 
 * Generates all required icon sizes from a source logo image.
 * 
 * Usage:
 *   1. Place your logo as 'logo-source.png' in the public/ directory
 *   2. Run: node scripts/generate-icons.js
 *   3. All icon sizes will be generated automatically
 * 
 * Requirements:
 *   npm install --save-dev sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SOURCE_LOGO = path.join(PUBLIC_DIR, 'logo-source.png');

// Icon sizes to generate
const ICON_SIZES = [
  { name: 'logo.png', size: 512 },
  { name: 'icon.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.ico', size: 32 },
];

async function generateIcons() {
  console.log('🎨 Misrak Shemeta Icon Generator\n');

  // Check if source logo exists
  if (!fs.existsSync(SOURCE_LOGO)) {
    console.error('❌ Error: logo-source.png not found in public/ directory');
    console.log('\n📝 Instructions:');
    console.log('   1. Save your logo as "logo-source.png" in the public/ directory');
    console.log('   2. Run this script again: node scripts/generate-icons.js');
    process.exit(1);
  }

  console.log('✅ Found source logo: logo-source.png\n');
  console.log('Generating icons...\n');

  try {
    // Generate each icon size
    for (const { name, size } of ICON_SIZES) {
      const outputPath = path.join(PUBLIC_DIR, name);
      
      await sharp(SOURCE_LOGO)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size}px)`);
    }

    console.log('\n🎉 All icons generated successfully!');
    console.log('\n📱 Your logo is now ready to use in:');
    console.log('   - Home page');
    console.log('   - Navigation bar');
    console.log('   - Browser tab (favicon)');
    console.log('   - PWA app icon');
    console.log('   - iOS home screen');
    console.log('\n💡 Tip: Refresh your browser (Ctrl+F5) to see the changes');

  } catch (error) {
    console.error('\n❌ Error generating icons:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure sharp is installed: npm install --save-dev sharp');
    console.log('   2. Verify logo-source.png is a valid PNG image');
    console.log('   3. Check file permissions');
    process.exit(1);
  }
}

// Run the generator
generateIcons();
