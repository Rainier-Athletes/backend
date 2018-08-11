import { Router } from 'express';
import HttpErrors from 'http-errors';
import Profile from '../model/profile';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';
import PointTracker from '../model/point-tracker';
import Whitelist from '../model/whitelist';
import Account from '../model/account';

const profileRouter = new Router();

profileRouter.post('/api/v1/profiles', bearerAuthMiddleware, (request, response, next) => {
  logger.log(logger.INFO, `.post /api/v1/profiles req.body: ${request.body}`);
  Profile.init()
    .then(() => {
      return new Profile({
        ...request.body,
        accountId: request.account._id,
      }).save();
    })
    .then((profile) => {
      logger.log(logger.INFO, `POST PROFILE ROUTER: new account created with 200 code, ${JSON.stringify(profile)}`);
      return response.json(profile);
    })
    .catch(next);
  return undefined;
});

profileRouter.get(['/api/v1/profiles', '/api/v1/profiles/me'], bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(404, 'PROFILE ROUTER GET: profile not found. Missing login info.', { expose: false }));
  if (request.query.id && request.profile.role !== 'admin') return next(new HttpErrors(401, 'User not authorized.'));
  
  if (request.query.id && request.profile.role === 'admin') {
    Profile.findOne({ _id: request.query.id })
      .then((profile) => {
        console.log(profile);
        return response.json(profile);
      })
      .catch(next);
    return undefined;
  }
  
  Profile.init()
    .then(() => {
      Profile.findOne({ _id: request.profile._id.toString() })
        .then((profile) => {
          delete profile.role;
          return response.json(profile);
        });
      return undefined;
    })
    .catch(next);
  return undefined;
});

// update route
profileRouter.put('/api/v1/profiles', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(404, 'PROFILE ROUTER GET: profile not found. Missing login info.', { expose: false }));

  if (!Object.keys(request.body).length) return next(new HttpErrors(400, 'PUT PROFILE ROUTER: Missing request body', { expose: false }));

  Profile.init()
    .then(() => {
      return Profile.findOneAndUpdate({ _id: request.profile._id }, request.body, { runValidators: true });
    })
    .then((profile) => {
      return Profile.findOne(profile._id);
    })
    .then((profile) => {
      response.json(profile);
    })
    .catch(next);
  return undefined;
});

profileRouter.delete('/api/v1/profiles', bearerAuthMiddleware, (request, response, next) => {
  if (!request.query.id) return next(new HttpErrors(400, 'DELETE PROFILE ROUTER: missing query', { expose: false }));

  Profile.init()
    .then(() => {
      return Profile.findByIdAndRemove(request.query.id);
    })
    .catch(() => {
      return next(new HttpErrors(404, 'Error deleting profile.', { expose: false }));
    })
    .then(() => {
      return PointTracker.remove({ studentId: request.profile._id });
    })
    .then(() => {
      return Whitelist.remove({ email: request.profile.email });
    })
    .then(() => {
      return Account.findByIdAndRemove(request.account._id);
    })
    .then(() => {
      return response.sendStatus(200);
    })
    .catch(() => {
      logger.log(logger.ERROR, 'DELETE PROFILE ROUTER: non-fatal errors deleting child resources');
    });
  return undefined;
});

export default profileRouter;
