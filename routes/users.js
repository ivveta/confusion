const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const User = require('../models/user');
const authenticate = require('../authenticate');
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

    if (req.body.firstname != null) {
      user.firstname = req.body.firstname;
    }
    if (req.body.lastname != null) {
      user.lastname = req.body.lastname;
    }

    user.save().then(user => {
      passport.authenticate('local')(req, res, () => {
        res.status = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'Registration Successful!' });
      });
    }, err => next(err));

    // user.save((err, user) => {
    //   if (err != null) {
    //     res.status = 500;
    //     res.setHeader('Content-Type', 'application/json');
    //     res.json({ err });
    //     return;
    //   }

    //   passport.authenticate('local')(req, res, () => {
    //     res.status = 200;
    //     res.setHeader('Content-Type', 'application/json');
    //     res.json({ success: true, status: 'Registration Successful!' });
    //   });
    // });
  });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  console.log(req.user);
  
  const token = authenticate.getToken({_id: req.user._id});
  res.status = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token, status: 'You are successfully logged in!' });

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
