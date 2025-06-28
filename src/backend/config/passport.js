
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { findUserById, createOrUpdateUser } = require('../services/user.service');

const configurePassport = () => {
  // Estrategia JWT
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await findUserById(payload.sub);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }));

  // Estrategia Google OAuth
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const userData = {
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        provider: 'google'
      };
      
      const user = await createOrUpdateUser(userData);
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));
};

module.exports = { configurePassport };