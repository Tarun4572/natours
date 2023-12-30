const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB Connection Successful');
  });
// .catch(err => console.log('DB Connection Error')); // handling DB connection error.
// console.log(app.get('env')); // set by express
// console.log(process.env);

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

// handling unhandledRejection. these are errors which developers might forget to catch.
process.on('unhandledRejection', err => {
  server.close(() => {
    process.exit(1);
  });
});
