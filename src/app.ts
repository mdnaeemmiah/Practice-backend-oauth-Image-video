import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './app/config/passport.config';
import router from './routes';
import notFound from './middlewares/auth';
import globalErrorHandler from './middlewares/NotFound';

// express
const app: Application = express();

// parsers
app.use(express.json());
// app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cors({
  origin: '*',
}));
app.use(cookieParser());

// Session middleware for OAuth
app.use(
  session({
    secret: process.env.JWT_ACCESS_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Practice Task World!');
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
