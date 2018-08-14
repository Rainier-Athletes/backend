import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import HttpError from 'http-errors';
import logger from './logger';

// middleware
import errorMiddleware from './middleware/error-middleware';
import loggerMiddleware from './middleware/logger-middleware';

// our routes
import authRouter from '../router/auth-router';
import googleOauthRouter from '../router/google-oauth-router';
import profileRouter from '../router/profile-router';
import pointTrackerRouter from '../router/point-tracker-router';
import whitelistRouter from '../router/whitelist-router';
import synopsisRouter from '../router/synopsis-router';
import relationshipRouter from '../router/relationship-router';

const app = express();
const PORT = process.env.PORT || 3000;
let server = null;

// here's the cors docs implementation:
// const whitelist = ['http://localhost:8080', 'http://mygarage-frontend.herokuapp.com'];
const originWhitelist = JSON.parse(process.env.CORS_ORIGINS);
console.log('server origins whitelist', originWhitelist);
const corsOptions2 = {
  origin: (origin, callback) => {
    console.log('server origin:', origin);
    if (originWhitelist.indexOf(origin) !== -1) {
      console.log('server origin passes whitelist.indexOf');
      callback(null, true);
    } else if (typeof origin === 'undefined') {
      console.log('server origin undefined: TESTING');
      callback(null, true);
    } else {
      console.log('server origin fails: not allowed');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.options('*', cors(corsOptions2));
app.use(cors(corsOptions2));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// our own api routers or middleware
app.use(loggerMiddleware);
app.use(googleOauthRouter);
app.use(authRouter);
app.use(whitelistRouter);
app.use(profileRouter);
app.use(pointTrackerRouter);
app.use(synopsisRouter);
app.use(relationshipRouter);

app.all('*', (request, response, next) => {
  logger.log(logger.INFO, 'returning 404 from the catch/all route');
  return next(new HttpError(404, 'Route Not Registered', { expose: false }));
});

app.use(errorMiddleware);

const startServer = () => {
  return mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
      server = app.listen(PORT, () => {
        console.log(`Server up on ${PORT}`);
      });
    })
    .catch((err) => {
      throw err;
    });
};

const stopServer = () => {
  return mongoose.disconnect()
    .then(() => {
      server.close();
    })
    .catch((err) => {
      throw err;
    });
};

export { startServer, stopServer };
