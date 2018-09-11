import { Router } from 'express';
// import HttpErrors from 'http-errors';
import StudentData from '../model/student-data';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';

const studentDataRouter = new Router();

studentDataRouter.post('/api/v1/studentdata', bearerAuthMiddleware, (request, response, next) => {
  StudentData.init()
    .then(() => {
      return new StudentData(request.body).save();
    })
    .then((data) => {
      logger.log(logger.INFO, `POST STUDENT DATA ROUTER: new profile created with 200 code, ${JSON.stringify(data)}`);
      return response.json(data).status(200);
    })
    .catch(next);
  return undefined;
});

export default studentDataRouter;
