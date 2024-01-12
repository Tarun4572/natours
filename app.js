const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1) GLOBAL Middlewares
//set security HTTP headers
app.use(helmet());

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// helps to handle DENIAL OF SERVICE attacks
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // allowing 100 requests in one hour
  message: 'Too Many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// body parser
app.use(express.json());

// Data sanitization against NOSQL query injection
app.use(mongoSanitize());

// Data sanitization against xss attack
app.use(xss());

// prevent parameter pollution
// tours?sort=duration&sort=price --> in this case contains multiple duplicate parameters which will break code,
// but there are new feilds where multiple same parameters are allowed like tours?duration=5&duration=10

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// TEST middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ERROR handling MIDDLEWARE
// when there is an error in the express middleware, it comes to erro handling middleware.
app.use(globalErrorHandler);
module.exports = app;
