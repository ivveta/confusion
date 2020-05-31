const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const authenticate = require('../authenticate');
const cors = require('./cors');
const User = require('../models/user');

const router = express.Router();

router.use(bodyParser.json());

router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
    .then(users => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    }, err => next(err));
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err != null) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({ err });
      return;
    }

    if (req.body.firstname != null) {
      user.firstname = req.body.firstname;
    }
    if (req.body.lastname != null) {
      user.lastname = req.body.lastname;
    }

    user.save().then(user => {
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'Registration Successful!' });
      });
    }, err => next(err));
  });
});

router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token, status: 'You are successfully logged in!' });

});

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
  if (req.session == null) {
    const err = new Error('You are not logged in');
    err.status = 403;
    return next(err);
  }

  req.session.destroy();
  res.clearCookie('session_id');
  res.redirect('/');
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token, status: 'You are successfully logged in!' });
});

module.exports = router;
