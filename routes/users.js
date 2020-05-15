const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');
const router = express.Router();

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find().then(users=>{
    res.status = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  })

});

router.post('/signup', (req, res, next) => {
  User
    .findOne({ username: req.body.username })
    .then(user => {
      if (user != null) {
        const err = new Error(`User ${req.body.username} already exists`);
        err.status = 403;
        return next(err);
      }

      User
        .create({
          username: req.body.username,
          password: req.body.password
        })
        .then(user => {
          res.status = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ status: 'Registration Successful!', user: user });
        }, err => next(err))
    }, err => next(err))
});

router.post('/login', (req, res, next) => {
  if (req.session.user != null) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already autenticated')
  }

  const authHeader = req.headers.authorization;

  if (authHeader == null) {
    const err = new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err);    
  }

  const auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

  const userName = auth[0];
  const pass = auth[1];

  User
    .findOne({ username: userName })
    .then(user => {
      if (user == null) {
        const err = new Error(`User ${userName} does not exist!`);
        err.status = 403;
        return next(err);
      }

      if (user.password !== pass) {
        const err = new Error('Your password is incorrect');
        err.status = 403;
        return next(err);
      }

      req.session.user = 'authenticated';
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('You are autenticated');

    }, err => next(err))
});

router.get('/logout', (req, res, next) => {
  if(req.session == null){
    const err = new Error('You are not logged in');
    err.status = 403;
    return next(err);
  }

  req.session.destroy();
  res.clearCookie('session_id');
  res.redirect('/');
});



module.exports = router;
