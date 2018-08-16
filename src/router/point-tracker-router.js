import { Router } from 'express';
import HttpErrors from 'http-errors';
import PointTracker from '../model/point-tracker';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';

const pointTrackerRouter = new Router();


pointTrackerRouter.get('/api/v1/pointstracker', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(401, 'GET POINTS ROUTER: not logged in', { expose: false }));

  const queryType = Object.keys(request.query)[0];
  if (!['id', 'studentId', 'date'].includes(queryType)) return next(new HttpErrors(400, 'GET POINTS TRACKER: bad request', { expose: false }));

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
          return response.json(scores);
        })
        .catch(next);
      return undefined;
    });
  return undefined;
});

pointTrackerRouter.post('/api/v1/pointstracker', bearerAuthMiddleware, (request, response, next) => {
  PointTracker.init()
    .then(() => {
      return new PointTracker(request.body).save();
    })
    .then((pointstracker) => {
      return response.json(pointstracker);
    })
    .catch(next);
  return undefined;
});

pointTrackerRouter.put('/api/v1/pointstracker', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(404, 'POINT-TRACKER ROUTER GET: Point tracker not found. Missing login info.', { expose: false }));

  if (!request.body) return next(new HttpErrors(400, 'PUT POINT-TRACKER ROUTER: Missing request body', { expose: false }));
  
  PointTracker.init()
    .then(() => {
      return PointTracker.findOneAndUpdate(request.body);
    })
    .then(() => {
      return PointTracker.findById(request.body._id.toString());
    })
    .then((updated) => {
      return response.json(updated).status(200);
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
  return response.sendStatus(200);
});

export default pointTrackerRouter;
