import { Router } from 'express';
import HttpErrors from 'http-errors';
import PointTracker from '../model/point-tracker';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';

const pointTrackerRouter = new Router();

pointTrackerRouter.get('/api/v1/pointstracker', bearerAuthMiddleware, (request, response, next) => {
  if (request.query.id) {
    PointTracker.init()
      .then(() => {
        PointTracker.findById(request.query.id)
          .then((pointTracker) => {
            return response.json(pointTracker);
          })
          .catch(next);
      });
    return undefined;
  }
  
  if (request.profile.role === 'admin') {
    PointTracker.init()
      .then(() => {
        return PointTracker.find();
      })
      .then((pointTracker) => {
        return response.json(pointTracker).status(200);
      })
      .catch(next);
    return undefined;
  } 
  return next(new HttpErrors(400, 'POINT-TRACKER GET: Bad request. Non-admin with no query.'));
});

pointTrackerRouter.post('/api/v1/pointstracker', bearerAuthMiddleware, (request, response, next) => {
  if (!request.body) return next(new HttpErrors(400, 'POINT-TRACKER ROUTER POST: Missing request body', { expose: false }));

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
  if (!request.body._id) return next(new HttpErrors(400, 'POINT-TRACKER ROUTER PUT: Missing request body', { expose: false }));
  
  PointTracker.init()
    .then(() => {
      return PointTracker.findOneAndUpdate(request.body);
    })
    .then((result) => {
      if (!result) return next(new HttpErrors(404, 'Unable to update point tracker'));
      return PointTracker.findById(request.body._id.toString());
    })
    .then((updated) => {
      if (!updated) return next(new HttpErrors(500, 'Unable to retrieve updated point tracker'));
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
