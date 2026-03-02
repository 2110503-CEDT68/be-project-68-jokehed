const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);

const express=require('express');
const dotenv=require('dotenv');
const campgrounds=require(`./routes/campgrounds`);
const connectDB=require('./config/db');
const auth=require('./routes/auth');
const cookieParser=require("cookie-parser");
const bookings=require('./routes/bookings');

dotenv.config({path:'./config/config.env'});

connectDB();

const app=express();

app.use(express.json());
app.use(cookieParser());

app.use(`/api/v1/campgrounds`,campgrounds);
app.use(`/api/v1/auth`,auth);

app.use('/api/v1/bookings',bookings);

app.set('query parser','extended');

const PORT=process.env.PORT||5000;
const server=app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});