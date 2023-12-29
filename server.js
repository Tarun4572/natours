const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
// console.log(app.get('env')); // set by express
// console.log(process.env);

const port = process.env.port || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
