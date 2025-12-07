const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const logDir = path.join(process.env.USERPROFILE || process.env.HOME, 'InvoiceGenerator', 'logs');

console.log('\n========================================');
console.log('Invoice Generator - Live Log Monitor');
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

const latestLogFile = path.join(logDir, logFiles[0]);

console.log(`Monitoring: ${logFiles[0]}`);
console.log(`Location: ${latestLogFile}\n`);
console.log('========================================');
console.log('Press Ctrl+C to stop monitoring');
console.log('========================================\n');

// Display existing content
if (fs.existsSync(latestLogFile)) {
  const existingContent = fs.readFileSync(latestLogFile, 'utf8');
  const lines = existingContent.split('\n');
  const lastLines = lines.slice(-50).join('\n');
  console.log(lastLines);
}

// Watch for changes
let lastSize = fs.statSync(latestLogFile).size;

fs.watchFile(latestLogFile, { interval: 500 }, (curr, prev) => {
  if (curr.size > lastSize) {
    const stream = fs.createReadStream(latestLogFile, {
      start: lastSize,
      end: curr.size,
      encoding: 'utf8'
    });

    stream.on('data', (chunk) => {
      process.stdout.write(chunk);
    });

    lastSize = curr.size;
  }
});

console.log('\n[Monitoring started - waiting for new log entries...]\n');

process.on('SIGINT', () => {
  console.log('\n\nMonitoring stopped.');
  process.exit(0);
});
