import { Router } from 'express';
import HttpErrors from 'http-errors';
import Profile from '../model/profile';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';
import Coach from '../model/coach';
import Mentor from '../model/mentor';
import School from '../model/school';
import ScoreSheet from '../model/score-sheet';
import Sport from '../model/sport';
import Staff from '../model/staff';
import Subject from '../model/subject';
import Teacher from '../model/teacher';
import Team from '../model/team';




const profileRouter = new Router();

profileRouter.post('/api/v1/profiles', bearerAuthMiddleware, (request, response, next) => {
  logger.log(logger.INFO, `.post /api/profiles req.body: ${request.body}`);
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

profileRouter.get(['/api/v1/profiles', '/api/profiles/me'], bearerAuthMiddleware, (request, response, next) => {
  if (!request.profile) return next(new HttpErrors(404, 'PROFILE ROUTER GET: profile not found. Missing login info.', { expose: false }));

  Profile.init()
    .then(() => {
      Profile.findOne({ _id: request.profile._id.toString() })
        .then((profile) => {
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
      return Profile.findOneAndUpdate({ _id: request.profile._id }, request.body);
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
  if (!request.query.id) return next(new HttpErrors(400, 'DELETE PROFILE ROUTER: bad query', { expose: false }));

  Profile.init()
    .then(() => {
      return Profile.findByIdAndRemove(request.query.id);
    })
    .then(() => {
      return Coach.remove({ profileId: request.query.id });
    })
    .then(() => {
      return Mentor.remove({ profileId: request.query.id });
    })
    .then(() => {
      return School.remove({ profileID: request.query.id });
    })
    .then(() => {
      return ScoreSheet.remove({ profileID: request.query.id });
    })
    .then(() => {
      return Sport.remove({ profileID: request.query.id });
    })
    .then(() => {
      return Staff.remove({ profileID: request.query.id });
    })
    .then(() => {
      return Subject.remove({ profileID: request.query.id });
    })
    .then(() => {
      return Teacher.remove({ profileID: request.query.id });
    })
    .then(() => {
      Team.remove({ profileID: request.query.id });
      return response.sendStatus(200);

    })


    .catch(next);
  return undefined;
});

export default profileRouter;
