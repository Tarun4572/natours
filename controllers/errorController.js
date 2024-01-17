/* eslint-disable no-lonely-if */
const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate Field Value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleJWTError = err => {
  return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = err => {
  return new AppError('Token has expired. Please log in again!', 401);
};

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      err: err,
      message: err.message,
      stack: err.stack
    });
  }
  // rendered website
  else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
  }
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
      // programming or other unknown error: don't leak error deatils
    } else {
      //1) log error
      console.error('Error 🧨', err);
      // 2) send generic message
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  } else {
    // Rendered website
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: err.message
      });
      // programming or other unknown error: don't leak error deatils
    } else {
      //1) log error
      console.error('Error 🧨', err);
      // 2) send generic message
      res.status(500).json({
        status: 'error',
        msg: 'Please try again later'
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (error.name === 'CastError') {
      error = handleCastErrorDB(err);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(err);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(err);
    }
    sendErrorProd(error, req, res);
  }
};
