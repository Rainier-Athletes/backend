import { Router } from 'express';
import HttpErrors from 'http-errors';
import PointTracker from '../model/point-tracker';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';

const pointTrackerRouter = new Router();


pointTrackerRouter.get('/api/v1/pointstracker', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(401, 'GET POINTS ROUTER: not logged in', { expose: false }));

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
  
  if (Object.keys(request.query).length > 0) {
    PointTracker.init()
      .then(() => {
        return PointTracker.find(request.query);
      })
      .then((queryReturn) => {
        return response.json(queryReturn);
      })
      .catch(next);
    return undefined;
  }
  
  if (request.PointTracker.role === 'admin') {
    PointTracker.init()
      .then(() => {
        return PointTracker.find();
      })
      .then((pointTracker) => {
        return response.json(pointTracker);
      })
      .catch(next);
    return undefined;
  }
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
    .then((result) => {
      if (!result) return next(new HttpErrors(500, 'Unable to update point tracker'));
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
