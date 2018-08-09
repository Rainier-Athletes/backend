import { Router } from 'express';
import HttpErrors from 'http-errors';
import PointTracker from '../model/point-tracker';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';

const pointTrackerRouter = new Router();


pointTrackerRouter.get('/api/v1/pointstracker', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(401, 'GET POINTS ROUTER: not logged in', { expose: false }));

  const queryType = Object.keys(request.query)[0];
  if (!['id', 'studentId', 'date'].includes(queryType)) return next(new HttpErrors(400, 'GET GARAGE ROUTER: bad request', { expose: false }));

  const modelMap = {
    id: '_id',
    studentId: 'studentId',
    date: 'date',
  };

  PointTracker.init()
    .then(() => {
      PointTracker.find({ [modelMap[queryType]]: request.query[queryType] })
        .then((scores) => {
          if (!scores) return next(new HttpErrors(404, `GET POINTS ROUTER: ${request.query} not found.`));
          logger.log(logger.info, `GET POINTS ROUTER returning\n${JSON.stringify(scores, null, 2)}`);
          return response.json(scores);
        })
        .catch(next);
      return undefined;
    });
});
