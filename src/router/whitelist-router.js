import { Router } from 'express';
import HttpErrors from 'http-errors';
import Whitelist from '../model/whitelist';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';
import whitelist from '../model/whitelist';

const whitelistRouter = new Router(); 

whitelistRouter.post('/api/v1/whitelists',
bearerAuthMiddleware, (request, response, next) => {
  logger.log(logger.INFO, `.post /api/whitelists req.body: ${request.body}`);
  Whitelist.init()
    .then(() => {
      return new Whitelist({
        ...request.body,
        accountId: request.account._id, 
      }).save();
    })
    .then((whitelist) => {
      logger.log(logger.INFO, `POST WHITELIST ROUTER: new email authorization with 200 code, ${JSON.stringify(whitelist)}`);
      return response.json(whitelist);
    })
    .catch(next);
    return undefined;
});

whitelistRouter.get(['/api/v1/whitelists', '/api/whitelists/me'], bearerAuthMiddleware, (request, response, next) => {
  if (!request.whitelist) return next(new HttpErrors(404, 'WHITELIST ROUTER GET: whitelist not found. Missing email.', { expose: false }));

  Whitelist.init()
    .then(() => {
      Whitelist.findOne({ _id: request.whitelist._id.toString() })
        .then((whitelist) => {
          return response.json(whitelist);
        });
        return undefined;
    })
    .catch(next);
    return undefined;
});

whitelistRouter.put('/api/v1/whitelists', bearerAuthMiddleware, (request, response, next) => {
  if (!request.whitelist) return next(new HttpErrors(404, 'WHITELIST ROUTER GET: whitelist not found. Email does not exist.', { expose: false }));

  if (!Object.keys(request.body).length) return next(new HttpErrors(400, 'PUT PROFILE ROUTER: Missing request body', { expose: false }));

  Whitelist.init()
    .then(() => {
      return Whitelist.findOneAndUpdate({ _id: request.profile._id }, request.body);
    })
    .then((whitelist) => {
      return Whitelist.findOne(whitelist._id);
    })
    .then((whitelist) => {
      response.json(whitelist);
    })
    .catch(next);
    return undefined
});

whitelistRouter.delete('/api/v1/whitelists', bearerAuthMiddleware, (request, response, next) => {
  if (!request.query.id) return next(new HttpErrors(400, 'DELETE WHITELIST ROUTER: bad query', { expose: false }));

  Whitelist.init()
    .then(() => {
      return Whitelist.findByIdAndRemove(request.query.id);
    })
})