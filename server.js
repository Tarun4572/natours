const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
console.log(app.get('env')); // set by express

// console.log(process.env);

const port = process.env.port || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
