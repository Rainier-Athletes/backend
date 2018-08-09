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
  return undefined;
});

pointTrackerRouter.post('/api/v1/pointstracker', bearerAuthMiddleware, (request, response, next) => {
  logger.log(logger.INFO, `.post /api/pointstracker req.body: ${request.body}`);
  PointTracker.init()
    .then(() => {
      return new PointTracker({
        ...request.body,
        studentId: request.studentId._id,
      }).save();
    })
    .then((pointstracker) => {
      logger.log(logger.INFO, `POST POINT-TRACKER ROUTER: new point tracker created with 200 code, ${JSON.stringify(pointstracker)}`);
      return response.json(pointstracker);
    })
    .catch(next);
  return undefined;
});

pointTrackerRouter.put('/api/v1/pointstracker', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(404, 'POINT-TRACKER ROUTER GET: Point tracker not found. Missing login info.', { expose: false }));

  if (!Object.keys(request.body).length) return next(new HttpErrors(400, 'PUT POINT-TRACKER ROUTER: Missing request body', { expose: false }));
  
  PointTracker.init()
    .then(() => {
      return PointTracker.findOneAndUpdate({ _id: request.pointtracker._id }, request.body);
    })
    .catch(next);
  return undefined;
});

pointTrackerRouter.delete('/api/v1/pointstracker', bearerAuthMiddleware, (request, response, next) => {
  if (!request.query.id) return next(new HttpErrors(400, 'DELETE POINT-TRACKER ROUTER: bad query', { expose: false }));

  PointTracker.init()
    .then(() => {
      return PointTracker.findByIdAndRemove(request.query.id);
    })
    .catch(next);
  return undefined;
});

export default pointTrackerRouter;
