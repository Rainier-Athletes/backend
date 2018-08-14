import { Router } from 'express';
import superagent from 'superagent';
import { google } from 'googleapis';
import HttpErrors from 'http-errors';
import Profile from '../model/profile';

// These are modules you will need to create a MongoDB account based off the Google response
// import crypto from 'crypto'; // maybe you want to use this to create a password for your MongoDB account
// import jwt from 'jsonwebtoken'; // you will DEFINITELY need this to "sign" your Google token
// import Account from '../model/account';
import logger from '../lib/logger';
import Whitelist from '../model/whitelist';

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';

const OPEN_ID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

require('dotenv').config();

const googleOAuthRouter = new Router();

googleOAuthRouter.get('/api/v1/oauth/google', async (request, response, next) => {
  if (!request.query.code) {
    logger.log(logger.ERROR, 'DID NOT GET CODE FROM GOOGLE');
    response.redirect(process.env.CLIENT_URL);
    return next(new HttpErrors(500, 'Google OAuth Error'));
  }
  logger.log(logger.INFO, `RECVD CODE FROM GOOGLE AND SENDING IT BACK TO GOOGLE: ${request.query.code}`);

  let raToken;
  let googleTokenResponse;
  try {
    googleTokenResponse = await superagent.post(GOOGLE_OAUTH_URL)
      .type('form')
      .send({
        code: request.query.code,
        access_type: 'offline',
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_OAUTH_ID,
        client_secret: process.env.GOOGLE_OAUTH_SECRET,
        redirect_uri: `${process.env.API_URL}/oauth/google`,
      });
  } catch (err) {
    logger.log(logger.ERROR, `ERROR FROM GOOGLE: ${JSON.stringify(err)}`);
    return next(new HttpErrors(err.status, 'Error from Google Oauth'));
  }

  if (!googleTokenResponse.body.access_token) {
    logger.log(logger.ERROR, 'No Token from Google');
    return response.redirect(process.env.CLIENT_URL);
  }
  logger.log(logger.INFO, `RECEIVED GOOGLE ACCESS TOKEN: ${JSON.stringify(googleTokenResponse.body, null, 2)}`);

  // const oAuth2Client = new google.auth.OAuth2(
  //   process.env.GOOGLE_OAUTH_ID,
  //   process.env.GOOGLE_OAUTH_SECRET,
  //   'http://localhost:3000/api/v1/oauth/google email profile openid',
  // );

  // this is what the drive example does once it
  // has a token. sends the whole object to setCreds
  // oAuth2Client.setCredentials(googleTokenResponse.body);
  // oauth2Client.setCredentials({ access_token: googleAccessToken });

  // google.options({
  //   auth: oAuth2Client,
  // });

  // console.log('oAuth2Client in google router', oAuth2Client);

  const googleAccessToken = googleTokenResponse.body.access_token;
  // const googleIdToken = googleTokenResponse.body.id_token;

  let openIdResponse;
  try {
    openIdResponse = await superagent.get(OPEN_ID_URL)
      .set('Authorization', `Bearer ${googleAccessToken}`);
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
  const { picture } = openIdResponse.body;

  
  // at this point we've completed google oauth. now we try to login to the app
  let loginResult;
  console.log('oAuth: oauthlogin, auth:', username, password, 'body:', googleTokenResponse.body);
  try {
    loginResult = await superagent.get(`${process.env.API_URL}/oauthlogin`)
      .auth(username, password)
      .send(googleTokenResponse.body)
      .withCredentials();
  } catch (err) {
    console.log('oAuth: login failed, checking whitelist for', email);
    loginResult = null;
  }

  // if loginResult is truthy we succeeded in logging. send cookies and redirect user to home page.
  if (loginResult) {
    console.log('oAuth: login succeeded. getting Profile', loginResult.body);
    // get profile
    let profile;
    try {
      profile = await Profile.findById(loginResult.body.profileId);
    } catch (err) {
      next(err);
    }
    console.log('oAuth: login succeeded. Sending response and cookies. Role:', profile.role);
    const cookieOptions = { maxAge: 7 * 1000 * 60 * 60 * 24 };
    response.cookie('RaToken', loginResult.body.token, cookieOptions);
    response.cookie('RaUser', Buffer.from(profile.role).toString('base64'), cookieOptions);
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
    signupResult = await superagent.post(`${process.env.API_URL}/oauthsignup`)
      .send({ 
        username,
        email,
        password,
        googleTokenResponse: googleTokenResponse.body,
      })
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
          firstName, lastName, email, role, picture, 
        });
    } catch (err) {
      next(err);
    }
    // we're all signed up using Oauth data.  Set the whitelist pending flag to false since
    // the invite has been accepted.

    wlResult.pending = false;
    console.log('oAuth: saving whitelist entry', wlResult);
    try {
      await wlResult.save();
    } catch (err) {
      console.log('oAuth: ERROR saving whitelist result with pending flag false');
    }

    console.log('oAuth: profile created:', JSON.stringify(profile, null, 2));
    console.log('oAuth: sending cookie and redirecting');
    const cookieOptions = { maxAge: 7 * 1000 * 60 * 60 * 24 };
    response.cookie('RaToken', raToken, cookieOptions);
    response.cookie('RaUser', Buffer.from(role).toString('base64'), cookieOptions);
    return response.redirect(process.env.CLIENT_URL);
  }
  return undefined;
});

export default googleOAuthRouter;
