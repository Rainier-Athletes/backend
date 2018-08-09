import { Router } from 'express';
import HttpErrors from 'http-errors';
import Whitelist from '../model/whitelist';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';

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

whitelistRouter.get('/api/v1/whitelists', bearerAuthMiddleware, (request, response, next) => {
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
  if (!Object.keys(request.body).length) return next(new HttpErrors(400, 'PUT WHITELIST ROUTER: Missing request body', { expose: false }));

  Whitelist.init()
    .then(() => {
      return Whitelist.findOneAndUpdate({ _id: request.body._id }, request.body);
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
  if (!request.query.id) return next(new HttpErrors(400, 'DELETE WHITELIST ROUTER: bad query', { expose: false }));

  Whitelist.init()
    .then(() => {
      return Whitelist.findByIdAndRemove(request.query.id);
    })
    .catch(next);
  return undefined;
});
