const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const FacebookTokenStrategy = require('passport-facebook-token');

const User = require('./models/user');
const config = require('./config');

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => jwt.sign(user, config.secretKey, { expiresIn: 3600 });

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secretKey,
};

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
  console.log('JWT payload: ', jwtPayload);

  User.findOne({ _id: jwtPayload._id }, (err, user) => {
    if (err != null) {
      return done(err, false);
    }
    if (user != null) {
      return done(null, user);
    }

    return done(null, false);
  })
}));

exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin) {
    return next();
  }

  const err = new Error('You are not authorized to perform this operation!');
  err.status = 403;
  next(err);
};

exports.facebookPassport = passport.use(new FacebookTokenStrategy(
  {
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret,
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOne({ facebookId: profile.id }, (err, user) => {
      if (err != null) {
        return done(err, false);
      }

      if (err == null && user != null) {
        return done(null, user);
      }

      // создание пользователя
      user = new User({
        username: profile.displayName,
        facebookId: profile.id,
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
      });
      user.save((err, user) => {
        if (err != null) {
          return done(err, false);
        }
        return done(null, user);
      })
    });
  }
));