
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from './database.js';

const jwtOptions = {
  jwtFromRequest: (req) => req.cookies.accessToken || null,
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    if (payload.type !== 'access') {
      return done(null, false, { message: 'Invalid token type' });
    }
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    return user ? done(null, user) : done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

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
