const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class Logger {
  constructor() {
    this.logDir = app.isPackaged 
      ? path.join(process.env.USERPROFILE || process.env.HOME, 'InvoiceGenerator', 'logs')
      : path.join(__dirname, '..', 'logs');
    
    this.logFile = path.join(this.logDir, `app-${this.getDateString()}.log`);
    this.initializeLogDirectory();
  }

  initializeLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  getTimestamp() {
    const now = new Date();
    return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      if (data instanceof Error) {
        logMessage += `\n  Error: ${data.message}\n  Stack: ${data.stack}`;
      } else if (typeof data === 'object') {
        logMessage += `\n  Data: ${JSON.stringify(data, null, 2)}`;
      } else {
        logMessage += `\n  Data: ${data}`;
      }
    }
    
    return logMessage;
  }

  writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n', 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message, data = null) {
    const logMessage = this.formatMessage('INFO', message, data);
    console.log(logMessage);
    this.writeToFile(logMessage);
  }

  warn(message, data = null) {
    const logMessage = this.formatMessage('WARN', message, data);
    console.warn(logMessage);
    this.writeToFile(logMessage);
  }

  error(message, data = null) {
    const logMessage = this.formatMessage('ERROR', message, data);
    console.error(logMessage);
    this.writeToFile(logMessage);
  }

  debug(message, data = null) {
    const logMessage = this.formatMessage('DEBUG', message, data);
    console.log(logMessage);
    this.writeToFile(logMessage);
  }

  separator() {
    const separator = '='.repeat(80);
    console.log(separator);
    this.writeToFile(separator);
  }

  getLogFilePath() {
    return this.logFile;
  }

  getLogDirectory() {
    return this.logDir;
  }
}

module.exports = new Logger();
