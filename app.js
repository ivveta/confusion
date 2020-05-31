const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');

const config = require('./config');

const dishRouter = require('./routes/dish');
const indexRouter = require('./routes/index');
const leaderRouter = require('./routes/leader');
const promoRouter = require('./routes/promo');
const uploadRouter = require('./routes/upload');
const usersRouter = require('./routes/users');
const favoritesRouter = require('./routes/favorites');

const url = config.mongoUrl;
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

connect
  .then(
    () => console.log('Connected correctly to server'),
    err => console.log(err));

const app = express();

app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }

  res.redirect(307, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promoRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoritesRouter);

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
