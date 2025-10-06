const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
    this.errorLogPath = path.join(logsDir, 'error.log');
    this.combinedLogPath = path.join(logsDir, 'combined.log');
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${message}${metaStr}\n`;
  }

  writeToFile(filePath, message) {
    try {
      fs.appendFileSync(filePath, message);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel];
  }

  error(message, meta = {}) {
    if (!this.shouldLog('ERROR')) return;
    
    const formattedMessage = this.formatMessage('ERROR', message, meta);
    console.error(`\x1b[31m${formattedMessage.trim()}\x1b[0m`);
    this.writeToFile(this.errorLogPath, formattedMessage);
    this.writeToFile(this.combinedLogPath, formattedMessage);
  }

  warn(message, meta = {}) {
    if (!this.shouldLog('WARN')) return;
    
    const formattedMessage = this.formatMessage('WARN', message, meta);
    console.warn(`\x1b[33m${formattedMessage.trim()}\x1b[0m`);
    this.writeToFile(this.combinedLogPath, formattedMessage);
  }

  info(message, meta = {}) {
    if (!this.shouldLog('INFO')) return;
    
    const formattedMessage = this.formatMessage('INFO', message, meta);
    console.log(`\x1b[36m${formattedMessage.trim()}\x1b[0m`);
    this.writeToFile(this.combinedLogPath, formattedMessage);
  }

  debug(message, meta = {}) {
    if (!this.shouldLog('DEBUG')) return;
    
    const formattedMessage = this.formatMessage('DEBUG', message, meta);
    console.log(`\x1b[37m${formattedMessage.trim()}\x1b[0m`);
    this.writeToFile(this.combinedLogPath, formattedMessage);
  }

  // HTTP request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          duration: `${duration}ms`,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        };

        if (res.statusCode >= 400) {
          this.error(`HTTP ${res.statusCode} ${req.method} ${req.originalUrl}`, logData);
        } else {
          this.info(`HTTP ${res.statusCode} ${req.method} ${req.originalUrl}`, logData);
        }
      });

      next();
    };
  }
}

module.exports = new Logger();
