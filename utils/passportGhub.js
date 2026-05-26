const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL, // e.g., 'http://localhost:3001/api/users/auth/github/callback',
      scope: ['user:email'] 
    },
    // This is the "verify" callback
    async (accessToken, refreshToken, profile, done) => {
      try {
        const githubId = profile.id;
        const username = profile.username || profile.displayName || `github-${githubId}`;
        const email = profile.emails && profile.emails.length ? profile.emails[0].value.toLowerCase() : null;

        let user = await User.findOne({ githubId });

        if (!user && email) {
          user = await User.findOne({ email });
        }

        if (user) {
          if (!user.githubId) {
            user.githubId = githubId;
            await user.save();
          }
          return done(null, user);
        }

        if (!email) {
          return done(new Error('GitHub did not provide an email for this account.'));
        }

        const newUser = await User.create({
          githubId,
          username,
          email,
        });

        return done(null, newUser);
      } catch (err) {
        done(err);
      }
    }
  )
);

// These functions are needed for session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});