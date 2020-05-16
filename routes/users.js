const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
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
  User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err != null) {
      res.status = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({ err });
      return;
    }

    passport.authenticate('local')(req, res, () => {
      res.status = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: true, status: 'Registration Successful!' });
    });
  });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.status = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, status: 'You are successfully logged in!' });

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
