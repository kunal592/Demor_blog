
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './database.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id: googleId, displayName: name, emails, photos } = profile;
        const email = emails[0].value;
        const avatar = photos[0].value;

        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          user = await prisma.user.update({
            where: { email },
            data: { name, avatar },
          });
        } else {
          user = await prisma.user.create({
            data: {
              googleId,
              email,
              name,
              avatar,
            },
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
