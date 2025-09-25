import passport from 'passport';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { prisma } from '../config/database.js';

const jwtOptions = {
  jwtFromRequest: (req) => req?.cookies?.accessToken || null,
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    if (!payload || payload.type !== 'access') return done(null, false);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    return user ? done(null, user) : done(null, false);
  } catch (err) {
    return done(err, false);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user || null);
  } catch (err) {
    done(err, null);
  }
});
