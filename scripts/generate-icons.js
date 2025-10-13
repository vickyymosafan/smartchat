/**
 * Script untuk generate PWA icons dari logo SmartChat
 * Menggunakan sharp untuk resize image
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/smartchat-logo.png');
const outputDir = path.join(__dirname, '../public/icons');

// Pastikan directory icons ada
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Generating PWA icons from SmartChat logo...\n');

  try {
    // Generate icons untuk berbagai ukuran
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputFile);
      
      console.log(`✅ Generated: icon-${size}x${size}.png`);
    }

    // Generate Apple Touch Icon (180x180)
    const appleTouchIcon = path.join(outputDir, 'apple-touch-icon.png');
    await sharp(inputFile)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(appleTouchIcon);
    
    console.log('✅ Generated: apple-touch-icon.png');

    // Generate favicon (32x32)
    const favicon32 = path.join(__dirname, '../public/icons/icon-32x32.png');
    await sharp(inputFile)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(favicon32);
    
    console.log('✅ Generated: icon-32x32.png');

    // Generate favicon (16x16)
    const favicon16 = path.join(__dirname, '../public/icons/icon-16x16.png');
    await sharp(inputFile)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(favicon16);
    
    console.log('✅ Generated: icon-16x16.png');

    // Generate favicon.ico dari icon 32x32
    const faviconIco = path.join(__dirname, '../public/favicon.ico');
    await sharp(inputFile)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(faviconIco);
    
    console.log('✅ Generated: favicon.ico');

    console.log('\n🎉 All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
