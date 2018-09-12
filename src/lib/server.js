import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import HttpError from 'http-errors';
import logger from './logger';

// middleware
import errorMiddleware from './middleware/error-middleware';
import loggerMiddleware from './middleware/logger-middleware';

// our routes
import googleOauthRouter from '../router/google-oauth-router';
import profileRouter from '../router/profile-router';
import pointTrackerRouter from '../router/point-tracker-router';
import synopsisRouter from '../router/synopsis-router';
import relationshipRouter from '../router/relationship-router';
import extractRouter from '../router/extract-router';
import studentDataRouter from '../router/student-data-router';

const app = express();
const PORT = process.env.PORT || 3000;
let server = null;

const originWhitelist = JSON.parse(process.env.CORS_ORIGINS);

const corsOptions2 = {
  origin: (origin, callback) => {
    if (originWhitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (typeof origin === 'undefined') {
      callback(null, true);
    } else {
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
app.use(profileRouter);
app.use(studentDataRouter);
app.use(pointTrackerRouter);
app.use(synopsisRouter);
app.use(extractRouter);
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
        console.log(`Server up on port ${PORT}`);
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
