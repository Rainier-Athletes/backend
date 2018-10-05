import { Router } from 'express';
import HttpErrors from 'http-errors';
import Profile from '../model/profile';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';

const profileRouter = new Router();

profileRouter.post('/api/v1/profiles', bearerAuthMiddleware, (request, response, next) => {
  logger.log(logger.INFO, `.post /api/v1/profiles req.body: ${request.body}`);
  Profile.init()
    .then(() => {
      return new Profile(request.body).save();
    })
    .then((profile) => {
      logger.log(logger.INFO, `POST PROFILE ROUTER: new profile created with 200 code, ${JSON.stringify(profile)}`);
      return response.json(profile);
    })
    .catch(next);
  return undefined;
});

profileRouter.get('/api/v1/profiles', bearerAuthMiddleware, (request, response, next) => {
  if (request.query.id && request.profile.role !== 'admin' && request.profile.role !== 'mentor') {
    return next(new HttpErrors(401, 'User not authorized to query by id.', { expose: false }));
  }
  if (request.query.id) {
    Profile.init()
      .then(() => {
        Profile.findById(request.query.id)
          .then((profile) => {
            return response.json(profile);
          })
          .catch(next);
      });
    return undefined;
  }

  if (Object.keys(request.query).length > 0) {
    Profile.init()
      .then(() => {
        return Profile.find(request.query);
      })
      .then((requestedPropReturn) => {
        return response.json(requestedPropReturn);
      })
      .catch(next);
    return undefined;
  }

  if (request.profile.role === 'admin') {
    Profile.init()
      .then(() => {
        return Profile.find();
      })
      .then((profiles) => {
        return response.json(profiles);
      })
      .catch(next);
    return undefined;
  }

  Profile.init()
    .then(() => {
      Profile.findById(request.profile._id.toString())
        .then((profile) => {
          delete profile.role;
          return response.json(profile);
        });
      return undefined;
    })
    .catch(next);
  return undefined;
});

profileRouter.get('/api/v1/profiles/me', bearerAuthMiddleware, (request, response, next) => {
  Profile.init()
    .then(() => {
      Profile.findById(request.profile._id.toString())
        .then((profile) => {
          return response.json(profile);
        });
      return undefined;
    })
    .catch(next);
  return undefined;
});

profileRouter.get('/api/v1/profiles/myStudents', bearerAuthMiddleware, (request, response, next) => {
  if (request.query.id && request.profile.role !== 'admin' && request.profile.role !== 'mentor') {
    return next(new HttpErrors(401, 'User not authorized to query by id.', { expose: false }));
  }

  Profile.init()
    .then(() => {
      return Profile.find()
        .where('_id')
        .in(request.profile.students);
    })
    .then((myStudents) => {
      return response.json(myStudents);
    })
    .catch(next);

  return undefined;
});


// update route
profileRouter.put('/api/v1/profiles', bearerAuthMiddleware, (request, response, next) => {
  if (!Object.keys(request.body).length) return next(new HttpErrors(400, 'PUT PROFILE ROUTER: Missing request body', { expose: false }));

  Profile.init()
    .then(() => {
      return Profile.findOneAndUpdate({ _id: request.body._id }, request.body, { runValidators: true });
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
  if (request.profile.role !== 'admin') return next(new HttpErrors(401, 'User not authorized to query by id.', { expose: false }));
  if (!request.query.id) return next(new HttpErrors(400, 'Bad delete request. Missing id query.', { expose: false }));
  Profile.init()
    .then(() => {
      return Profile.findById(request.query.id);
    })
    .then((profile) => {
      if (!profile) return next(new HttpErrors(404, 'Error locating profile for inactivation', { expose: false }));
      profile.active = false;
      return profile.save();
    })
    // .catch((err) => {
      
    // })
    // .then(() => {
    //   return PointTracker.remove({ studentId: request.profile._id });
    // })
    .then(() => {
      return response.json(request.query.id).status(200);
    })
    .catch((err) => {
      logger.log(logger.ERROR, 'DELETE PROFILE ROUTER: non-fatal errors deactivating profile');
      return next(new HttpErrors(404, `Error deactivating profile: ${err}`, { expose: false }));
      // return response.status(200);
    });
  return undefined;
});

export default profileRouter;
