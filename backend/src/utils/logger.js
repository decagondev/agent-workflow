import winston from 'winston';
import path from 'path';

const logDir = path.join(__dirname, '../logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ''}`;
        })
      )
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      handleExceptions: true
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      handleExceptions: true
    })
  ],
  exitOnError: false
});

const requestLogger = (req, res, next) => {
  const { method, url, body, query } = req;
  logger.info(`${method} ${url}`, {
    body: Object.keys(body).length > 0 ? body : undefined,
    query: Object.keys(query).length > 0 ? query : undefined,
    ip: req.ip
  });
  next();
};

export { logger, requestLogger };
