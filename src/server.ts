require('dotenv').config();
import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import router from './routes';
import Logger from './utils/Logger';
import cors from 'cors';
import useragent from "express-useragent";
const isDevEnvironment = process.env.NODE_ENV || 'development';

const app = express();
app.use(useragent.express());
app.use(logger(isDevEnvironment ? 'dev' : 'short'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors(),function (req:any, res:any, next:any) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type","Accept", "Authorization", "Origin, X-Requested-With");
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  
  next();
})

app.use(router);

// catch 404 and forward to error handler
app.use(function(req:any, res:any, next:any) {
  next(createError(404));
});

// error handler
app.use(function(err:any, req:any, res:any, next:any) {
  console.log('error-----', err)
  const mliteUniqueKey = "File-Storage-util" + String(Date.now() * Math.random()).split(".")[0];
  Logger.errorX({
    stack: err && err.stack,
    message: (err && err.message) || err,
    timestamp: Date.now()
  }, mliteUniqueKey);
  
  err = (err && err.customError) ? err : createError((err && err.status)|| 500); // Added this part so we only send intentionally thrown errors to user
  const data = {
    key: mliteUniqueKey,
    err: isDevEnvironment ? err : err.message
  }
  const result = {
    status: 'error',
    message: err.message,
    data
  };
  res.status(err.status).json(result);
});

export default app;
