import { Router } from 'express';
import superagent from 'superagent';
import HttpErrors from 'http-errors';
import Oauth2Client from 'client-oauth2';

// import Account from '../model/account';
import logger from '../lib/logger';
import Whitelist from '../model/whitelist';

const BASECAMP_ACCESS_URL = 'https://launchpad.37signals.com/authorization/new';
const BASECAMP_TOKEN_URL = 'https://launchpad.37signals.com/authorization/token';
const BASECAMP_REDIRECT_URL = `${process.env.API_URL}/oauth/basecamp`;

// const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
// const OPEN_ID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

require('dotenv').config();
 
const basecampAuth = new Oauth2Client({
  clientId: process.env.BASECAMP_OAUTH_ID,
  clientSecret: process.env.BASECAMP_OAUTH_SECRET,
  accessTokenUri: BASECAMP_TOKEN_URL,
  authorizationUri: BASECAMP_ACCESS_URL,
  redirectUri: BASECAMP_REDIRECT_URL,
  scopes: [],
});

const basecampOAuthRouter = new Router();

basecampOAuthRouter.get('/api/v1/oauth/basecamp', async (request, response, next) => {
  console.log('basecamp oAuth: request.query.code', request.query.code);


  if (!request.query.code) {
    logger.log(logger.ERROR, 'DID NOT GET CODE FROM BASECAMP');
    response.redirect(process.env.CLIENT_URL);
    return next(new HttpErrors(500, 'Basecamp OAuth Error'));
  }
  logger.log(logger.INFO, `RECVD CODE FROM BASECAMP AND SENDING IT BACK FOR TOKEN: ${request.query.code}`);

  // POST https://launchpad.37signals.com/authorization/token?
  // type=web_server&
  // client_id=your-client-id&
  // redirect_uri=your-redirect-uri&
  // client_secret=your-client-secret&
  // code=verification-code

  const bcQuery = {
    type: 'web_server',
    client_id: process.env.BASECAMP_OAUTH_ID,
    redirect_uri: BASECAMP_REDIRECT_URL,
    client_secret: process.env.BASECAMP_OAUTH_SECRET,
    code: request.query.code,
  };

  let raToken;
  let basecampTokenResponse;

  try {
    basecampTokenResponse = await superagent.post(BASECAMP_TOKEN_URL)
      .query(bcQuery);
  } catch (err) {
    logger.log(logger.ERROR, `ERROR FROM BASECAMP: ${JSON.stringify(err)}`);
    return next(new HttpErrors(err.status, 'Error from Basecamp Oauth'));
  }

  if (!basecampTokenResponse.body.access_token) {
    logger.log(logger.ERROR, 'No Token from Basecamp');
    return response.redirect(process.env.CLIENT_URL);
  }
  logger.log(logger.INFO, `RECEIVED BASECAMP ACCESS TOKEN: ${JSON.stringify(basecampTokenResponse.body, null, 2)}`);
  const accessToken = basecampTokenResponse.body.access_token;

  let openIdResponse;
  try {
    openIdResponse = await superagent.get(OPEN_ID_URL)
      .set('Authorization', `Bearer ${accessToken}`);
  } catch (err) {
    logger.log(logger.ERROR, `OpenId request failed, error: ${JSON.stringify(err, null, 2)}`);
    return response.sentStatus(err.status);
  }

  logger.log(logger.INFO, `OPEN ID: ${JSON.stringify(openIdResponse.body, null, 2)}`);
  const email = openIdResponse.body.email; // eslint-disable-line
  const username = email; 
  const password = openIdResponse.body.sub;
  const firstName = openIdResponse.body.given_name;
  const lastName = openIdResponse.body.family_name;
  console.log('oAuth: logging in. Data:', username, email, password, firstName, lastName);
  let loginResult;
  try {
    loginResult = await superagent.get(`${process.env.API_URL}/login`)
      .auth(username, password)
      .withCredentials();
  } catch (err) {
    console.log('oAuth: login failed, checking whitelist for', email);
    loginResult = null;
  }

  if (loginResult) {
    console.log('oAuth: login succeeded. Sending response and cookie');
    const cookieOptions = { maxAge: 7 * 1000 * 60 * 60 * 24 };
    response.cookie('RaToken', loginResult.body.token, cookieOptions);
    return response.redirect(process.env.CLIENT_URL);
  } 
  // login failed, create account and profile
  // no account? Check Whitelist for the email
  console.log('oAuth: login failed, checking whitelist for', email);
  let wlResult = await Whitelist.findOne({ email });
  console.log('oAuth: whitelist result', wlResult);
  if (!wlResult && email === JSON.parse(process.env.ROOT_ADMIN).email) {
    console.log('oAuth: using .env ROOT_ADMIN credentials');
    wlResult = JSON.parse(process.env.ROOT_ADMIN);
  }
  let signupResult;
  if (!wlResult) {
    console.log('oAuth: Email not in whitelist. returning status 401: Not Authorized');
    return response.sendStatus(401);
  }
  // email in whitelist, create account
  let { role } = wlResult; //eslint-disable-line
  console.log('oAuth: email found in whitelist, creating account for', email);
  try {
    signupResult = await superagent.post(`${process.env.API_URL}/signup`)
      .send({ username, email, password })
      .withCredentials();
  } catch (err) {
    next(err);
  }
  let profile;
  if (signupResult) {
    console.log('oAuth: create account succeeded, creating profile with role:', role);
    raToken = signupResult.body.token;
    try {
      profile = await superagent.post(`${process.env.API_URL}/profiles`)
        .set('Authorization', `Bearer ${raToken}`)
        .send({ 
          firstName, lastName, email, role, 
        });
    } catch (err) {
      next(err);
    }

    console.log('oAuth: profile created:', JSON.stringify(profile, null, 2));
    console.log('oAuth: sending cookie and redirecting');
    const cookieOptions = { maxAge: 7 * 1000 * 60 * 60 * 24 };
    response.cookie('RaToken', raToken, cookieOptions);

    return response.redirect(process.env.CLIENT_URL);
  }
  return undefined;
});

export default basecampOAuthRouter;
