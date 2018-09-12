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
      return StudentData.find(query);
    })
    .then((result) => {
      return response.json(result).status(result ? 200 : 404);
    })
    .catch(next);
  return undefined;
});

studentDataRouter.put('/api/v1/studentdata', bearerAuthMiddleware, (request, response, next) => {
  const body = request.body && typeof request.body === 'object' && request.body !== null && Object.keys(request.body).length > 0 ? request.body : false;

  if (!body) return next(new HttpErrors(400, 'Missing PUT request body', { expose: false }));

  StudentData.init()
    .then(() => {
      return StudentData.findOneAndUpdate({ _id: request.body._id }, request.body, { runValidators: true });
    })
    .then((data) => {
      return StudentData.findOne(data._id);
    })
    .then((data) => {
      response.json(data).status(200);
    })
    .catch(next);
  return undefined;
});

studentDataRouter.delete('/api/v1/studentdata', bearerAuthMiddleware, (request, response, next) => {
  const id = request.query.id || false;

  if (!id) return next(new HttpErrors(400, 'Missing DELETE query id', { expose: false }));

  StudentData.init()
    .then(() => {
      return StudentData.findByIdAndRemove(request.query.id);
    })
    .then(() => {
      return response.sendStatus(200);
    })
    .catch((err) => {
      return next(new HttpErrors(404, `Error deleting student data: ${err}`));
    });
  return undefined;
});

export default studentDataRouter;
