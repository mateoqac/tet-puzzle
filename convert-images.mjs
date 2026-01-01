import sharp from 'sharp';
import { readFileSync } from 'fs';

// Convert OG Image
const ogSvg = readFileSync('/Users/mateqac/Work/tetonor-puzzle/og-image.svg');
await sharp(ogSvg)
  .resize(1200, 630)
  .png()
  .toFile('/Users/mateqac/Work/tetonor-puzzle/public/og-image.png');

console.log('✓ Created og-image.png (1200x630)');

// Convert Apple Touch Icon
const iconSvg = readFileSync('/Users/mateqac/Work/tetonor-puzzle/apple-touch-icon.svg');
await sharp(iconSvg)
  .resize(180, 180)
  .png()
  .toFile('/Users/mateqac/Work/tetonor-puzzle/public/apple-touch-icon.png');

console.log('✓ Created apple-touch-icon.png (180x180)');

// Convert Logo for Schema (512x512)
const faviconSvg = readFileSync('/Users/mateqac/Work/tetonor-puzzle/public/favicon.svg');
await sharp(faviconSvg)
  .resize(512, 512)
  .png()
  .toFile('/Users/mateqac/Work/tetonor-puzzle/public/logo-512.png');

console.log('✓ Created logo-512.png (512x512)');

console.log('\nAll images created successfully!');
