const fs = require('fs');
const path = require('path');

// Create build directory if it doesn't exist
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
  console.log('✓ Created build directory');
}

console.log('\n📋 Build directory setup complete!');
console.log('\nNext steps:');
console.log('1. Add your app icon as:');
console.log('   - build/icon.ico (Windows - required)');
console.log('   - build/icon.icns (macOS - optional)');
console.log('   - build/icon.png (Linux - optional)');
console.log('\n2. You can use online tools to convert PNG to ICO:');
console.log('   - https://convertio.co/png-ico/');
console.log('   - https://www.icoconverter.com/');
console.log('\n3. Icon should be 256x256 or 512x512 pixels');
