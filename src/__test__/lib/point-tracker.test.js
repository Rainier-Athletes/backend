import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import faker from 'faker';
import { createPointTrackerMockPromise, removeAllResources } from './point-tracker-mock';
import { createProfileMockPromise, removeAllResources } from './lib/profile-mock';

