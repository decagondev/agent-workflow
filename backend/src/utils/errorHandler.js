import { logger } from './logger.js';

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`${err.status.toUpperCase()} - ${err.message}`, {
    stack: err.stack,
    route: req.originalUrl,
    method: req.method
  });

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const handleUnhandledRejections = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
      process.exit(1);
    });
  });
};

const handleUncaughtExceptions = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
};

export {
  AppError,
  errorHandler,
  catchAsync,
  handleUnhandledRejections,
  handleUncaughtExceptions
};
