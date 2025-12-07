const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const logDir = path.join(process.env.USERPROFILE || process.env.HOME, 'InvoiceGenerator', 'logs');

console.log('\n========================================');
console.log('Invoice Generator - Log Viewer');
console.log('========================================\n');

if (!fs.existsSync(logDir)) {
  console.log('No logs directory found at:', logDir);
  console.log('\nThe application may not have been run yet.');
  console.log('Logs will be created when you run the application.');
  process.exit(0);
}

const logFiles = fs.readdirSync(logDir)
  .filter(file => file.endsWith('.log'))
  .sort()
  .reverse();

if (logFiles.length === 0) {
  console.log('No log files found in:', logDir);
  console.log('\nThe application may not have been run yet.');
  process.exit(0);
}

console.log(`Found ${logFiles.length} log file(s):\n`);
logFiles.forEach((file, index) => {
  const filePath = path.join(logDir, file);
  const stats = fs.statSync(filePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  console.log(`${index + 1}. ${file} (${sizeKB} KB) - Modified: ${stats.mtime.toLocaleString()}`);
});

console.log('\n========================================');
console.log('Viewing latest log file:');
console.log('========================================\n');

const latestLogFile = path.join(logDir, logFiles[0]);
console.log(`File: ${latestLogFile}\n`);

const logContent = fs.readFileSync(latestLogFile, 'utf8');
console.log(logContent);

console.log('\n========================================');
console.log('End of log file');
console.log('========================================\n');
console.log('Press any key to exit...');

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {
  process.exit(0);
});
