const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

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