var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var dishRouter = require('./routes/dishRouter');
var leaderRouter = require('./routes/leaderRouter');
var promoRouter = require('./routes/promoRouter');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

connect
  .then(
    () => console.log('Connected correctly to server'),
    err => console.log(err))

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('secter-key-012345-78790-46997'));

const auth = (req, res, next) => {
  console.log('signedCookies', req.signedCookies);

  if (req.signedCookies.user === 'admin') {
    return next(); // authorized
  }

  if (req.signedCookies.user == null) {
    const authHeader = req.headers.authorization;

    if (authHeader == null) {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);

      return;
    }

    const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

    const user = auth[0];
    const pass = auth[1];

    if (user === 'admin' && pass === 'password') {
      res.cookie('user', 'admin', { signed: true })
      next();
    } else {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      next(err);
    }
  } else {
    const err = new Error('You are not authenticated!');
    err.status = 401;
    next(err);
  }
};

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promoRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
