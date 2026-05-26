const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/userSchema');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const user = await User.findById(jwtPayload.id).select('-password');
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

function initializePassport(app) {
  app.use(passport.initialize());
}

const authenticateToken = passport.authenticate('jwt', { session: false });

module.exports = {
  initializePassport,
  authenticateToken,
};
