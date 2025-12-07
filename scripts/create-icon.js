const fs = require('fs');
const path = require('path');

// Create a proper 256x256 ICO file
const iconPath = path.join(__dirname, '..', 'build', 'icon.ico');

console.log('Creating 256x256 ICO file...');

// ICO file header
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);      // Reserved
icoHeader.writeUInt16LE(1, 2);      // Type (1 = ICO)
icoHeader.writeUInt16LE(1, 4);      // Number of images

// Image directory entry for 256x256
const imageDir = Buffer.alloc(16);
imageDir.writeUInt8(0, 0);          // Width (0 = 256)
imageDir.writeUInt8(0, 1);          // Height (0 = 256)
imageDir.writeUInt8(0, 2);          // Color palette
imageDir.writeUInt8(0, 3);          // Reserved
imageDir.writeUInt16LE(1, 4);       // Color planes
imageDir.writeUInt16LE(32, 6);      // Bits per pixel
imageDir.writeUInt32LE(262184, 8);  // Size of image data
imageDir.writeUInt32LE(22, 12);     // Offset to image data

// BMP header
const bmpHeader = Buffer.alloc(40);
bmpHeader.writeUInt32LE(40, 0);     // Header size
bmpHeader.writeInt32LE(256, 4);     // Width
bmpHeader.writeInt32LE(512, 8);     // Height (doubled for ICO)
bmpHeader.writeUInt16LE(1, 12);     // Planes
bmpHeader.writeUInt16LE(32, 14);    // Bits per pixel
bmpHeader.writeUInt32LE(0, 16);     // Compression
bmpHeader.writeUInt32LE(262144, 20);// Image size
bmpHeader.writeInt32LE(0, 24);      // X pixels per meter
bmpHeader.writeInt32LE(0, 28);      // Y pixels per meter
bmpHeader.writeUInt32LE(0, 32);     // Colors used
bmpHeader.writeUInt32LE(0, 36);     // Important colors

// Create a 256x256 gradient icon (BGRA format)
const pixels = Buffer.alloc(256 * 256 * 4);
for (let y = 0; y < 256; y++) {
  for (let x = 0; x < 256; x++) {
    const i = ((255 - y) * 256 + x) * 4; // Flip vertically for BMP
    
    // Create a nice gradient from blue to purple
    const gradientFactor = x / 255;
    const blue = Math.floor(0xF6 * (1 - gradientFactor) + 0xCF * gradientFactor);
    const green = Math.floor(0x82 * (1 - gradientFactor) + 0x5C * gradientFactor);
    const red = Math.floor(0x3B * (1 - gradientFactor) + 0x8B * gradientFactor);
    
    // Add some circular shape
    const centerX = 128;
    const centerY = 128;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const alpha = distance < 120 ? 0xFF : Math.max(0, 0xFF - (distance - 120) * 8);
    
    pixels[i + 0] = blue;   // Blue
    pixels[i + 1] = green;  // Green
    pixels[i + 2] = red;    // Red
    pixels[i + 3] = alpha;  // Alpha
  }
}

// AND mask (all transparent since we use alpha channel)
const andMask = Buffer.alloc(256 * 256 / 8, 0x00);

// Combine all parts
const icoFile = Buffer.concat([icoHeader, imageDir, bmpHeader, pixels, andMask]);

// Write the file
fs.writeFileSync(iconPath, icoFile);

console.log('✓ Created 256x256 icon at:', iconPath);
console.log('  File size:', Math.floor(icoFile.length / 1024), 'KB');
