import { Router } from 'express';
import HttpErrors from 'http-errors';
import StudentData from '../model/student-data';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
// import logger from '../lib/logger';

const studentDataRouter = new Router();

studentDataRouter.post('/api/v1/studentdata', bearerAuthMiddleware, (request, response, next) => {
  const body = request.body && typeof request.body === 'object' && request.body !== null && Object.keys(request.body).length > 0 ? request.body : false;

  if (!body) return next(new HttpErrors(400, 'Missing POST request body', { expose: false }));

  StudentData.init()
    .then(() => {
      return new StudentData(body).save();
    })
    .then((data) => {
      return response.json(data).status(200);
    })
    .catch(next);
  return undefined;
});

studentDataRouter.get('/api/v1/studentdata', bearerAuthMiddleware, (request, response, next) => {
  const haveQuery = request.query && typeof request.query === 'object' && request.query !== null && Object.keys(request.query).length > 0;

  if (!haveQuery) return next(new HttpErrors(400, 'Missing query string', { expose: false }));

  let queryProp = Object.keys(request.query)[0];
  const queryValue = request.query[queryProp];
  queryProp = queryProp === 'id' ? '_id' : queryProp;

  StudentData.init()
    .then(() => {
      const query = { [queryProp]: queryValue };
      console.log(query);
      return StudentData.find(query);
    })
    .then((result) => {
      return response.json(result).status(result ? 200 : 404);
    })
    .catch(next);
});

export default studentDataRouter;
