import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import passport from 'passport';
import { Strategy as GoogleStrategy} from 'passport-google-oauth20';
import config from './config/config.js'
import cors from 'cors';

const app = express();

// Middleware setup
app.use(morgan('dev'));

// Simplified CORS: trust explicit frontend origin and allow credentials.
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));

console.log('[CORS] auth origin:', config.FRONTEND_URL || '<none>');

app.use(express.json());

app.use(cookieParser());

app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);


// Configure Passport to use Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
  callbackURL: config.BACKEND_URL ? `${config.BACKEND_URL}/api/auth/google/callback` : '/api/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  // Here, you would typically find or create a user in your database
  // For this example, we'll just return the profile
  return done(null, profile);
}));


export default app;