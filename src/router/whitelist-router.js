import { Router } from 'express';
import HttpErrors from 'http-errors';
import Whitelist from '../model/whitelist';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';

const whitelistRouter = new Router();

whitelistRouter.post('/api/v1/whitelists', bearerAuthMiddleware,
  (request, response, next) => {
    logger.log(logger.INFO, `.post at /api/v1/whitelists req.body: ${JSON.stringify(request.body, null, 2)}`);
    if (!request.profile) return next(new HttpErrors(404, 'PROFILE ROUTER GET: profile not found. Missing login info.', { expose: false }));
    if (request.profile.role !== 'admin') return next(new HttpErrors(401, 'User not authorized.'));

    Whitelist.init() 
      .then(() => {
        return new Whitelist({
          ...request.body,
        }).save();
      })
      .then((whitelist) => {
        logger.log(logger.INFO, `POST WHITELIST ROUTER: new email authorization with 200 code, ${JSON.stringify(whitelist)}`);
        return response.json(whitelist);
      })
      .catch(next);
    return undefined;
  });

whitelistRouter.get('/api/v1/whitelists', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(404, 'PROFILE ROUTER GET: profile not found. Missing login info.', { expose: false }));

  if (request.profile.role !== 'admin') return next(new HttpErrors(401, 'User not authorized.'));

  Whitelist.init()
    .then(() => {
      Whitelist.find()
        .then((whitelist) => {
          return response.json(whitelist);
        });
      return undefined;
    })
    .catch(next);
  return undefined;
});

whitelistRouter.put('/api/v1/whitelists', bearerAuthMiddleware, (request, response, next) => { 
  if (!request.profile) return next(new HttpErrors(404, 'PROFILE ROUTER GET: profile not found. Missing login info.', { expose: false }));

  if (request.profile.role !== 'admin') return next(new HttpErrors(401, 'User not authorized.'));
  
  if (!Object.keys(request.body).length) return next(new HttpErrors(400, 'PUT WHITELIST ROUTER: Missing request body', { expose: false }));

  Whitelist.init()
    .then(() => {
      return Whitelist.findOneAndUpdate({ _id: request.body._id }, request.body, { runValidators: true });
    })
    .then((whitelist) => {
      return Whitelist.findOne(whitelist._id);
    })
    .then((whitelist) => {
      response.json(whitelist);
    })
    .catch(next);
  return undefined;
});

whitelistRouter.delete('/api/v1/whitelists', bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(404, 'PROFILE ROUTER GET: profile not found. Missing login info.', { expose: false }));
  
  if (request.profile.role !== 'admin') return next(new HttpErrors(401, 'User not authorized.'));

  if (!request.query.id) return next(new HttpErrors(400, 'DELETE WHITELIST ROUTER: bad query', { expose: false }));

  Whitelist.init()
    .then(() => {
      return Whitelist.findByIdAndRemove(request.query.id);
    })
    .catch(next);
  return undefined;
});

export default whitelistRouter;
