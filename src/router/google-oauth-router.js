import { Router } from 'express';
import superagent from 'superagent';
import HttpErrors from 'http-errors';

// These are modules you will need to create a MongoDB account based off the Google response
// import crypto from 'crypto'; // maybe you want to use this to create a password for your MongoDB account
// import jwt from 'jsonwebtoken'; // you will DEFINITELY need this to "sign" your Google token
// import Account from '../model/account';
import logger from '../lib/logger';
import Whitelist from '../model/whitelist';
import Profile from '../model/profile';

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const OPEN_ID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

require('dotenv').config();

const googleOAuthRouter = new Router();

googleOAuthRouter.get('/api/v1/oauth/google', (request, response, next) => {
  /*
    Account.init()
      .then(() => {
        // find out where the below code should be moved in this block

        // accounting for case if a Google user already exists in db
          * query the db based off user's email
          * if no account
              * create account, advise using Account.create(...args)
              * advise using crypto/uuid to generate an arbitrary password
              * When new account is returned, set the account's tokenSeed property to the "accessToken" variable we got from Google and save the new account to update it in the db
              * You get the updated account and then grap the updated account's tokenSeed property and pass it into "jwt.sign"
              * If this works, you get a newly encrypted token that will be written as a cookie on the browser, and you will redirect back to the client homepage
          * else if the account DOES exist in db already
              * You get the account grap the  account's tokenSeed property and pass it into "jwt.sign"
              * If this works, you get a newly encrypted token that will be written as a cookie on the browser, and you will redirect back to the client homepage
          *Put catch blocks and handle errors in appropriate places

        // 

      })

  */

  // console.log('google auth request.headers.host object', request.originalUrl);
  // I will already have a request.query.code attached to the request object from Google at this point
  if (!request.query.code) {
    logger.log(logger.ERROR, 'DID NOT GET CODE FROM GOOGLE');
    response.redirect(process.env.CLIENT_URL);
    return next(new HttpErrors(500, 'Google OAuth Error'));
  }
  logger.log(logger.INFO, `RECVD CODE FROM GOOGLE AND SENDING IT BACK TO GOOGLE: ${request.query.code}`);

  // Once we have the Google code, we send it back to Google' server that deals with making tokens

  let accessToken;
  let username;
  let password;
  let email;
  let firstName;
  let lastName;
  let role;
  // const bio = 'Tell us about yourself! Edit your profile.';
  // let profileImageUrl;
  let raToken;
  let done = false;
  return superagent.post(GOOGLE_OAUTH_URL)
    .type('form')
    .send({
      code: request.query.code,
      grant_type: 'authorization_code',
      client_id: process.env.GOOGLE_OAUTH_ID,
      client_secret: process.env.GOOGLE_OAUTH_SECRET,
      redirect_uri: `${process.env.API_URL}/oauth/google`,
    })
    .then((googleTokenResponse) => {
      if (!googleTokenResponse.body.access_token) {
        logger.log(logger.ERROR, 'No Token from Google');
        return response.redirect(process.env.CLIENT_URL);
      }
      logger.log(logger.INFO, `RECEIVED GOOGLE ACCESS TOKEN: ${JSON.stringify(googleTokenResponse.body, null, 2)}`);
      accessToken = googleTokenResponse.body.access_token;

      return superagent.get(OPEN_ID_URL)
        .set('Authorization', `Bearer ${accessToken}`);
    })
    .then((openIDResponse) => {
      logger.log(logger.INFO, `OPEN ID: ${JSON.stringify(openIDResponse.body, null, 2)}`);
      email = openIDResponse.body.email; // eslint-disable-line
      username = email; 
      password = openIDResponse.body.sub;
      firstName = openIDResponse.body.given_name;
      lastName = openIDResponse.body.family_name;
      // profileImageUrl = openIDResponse.body.picture;

      return superagent.get(`${process.env.API_URL}/login`)
        .auth(username, password)
        .withCredentials();
    })
    .then((loginResult) => {
      console.log('oAuth: login succeeded. Checking for changes to role');
      raToken = loginResult.body.token;
      // check whitelist for change in role
      return Whitelist.findOne({ email });
    })
    .then((result) => {
      if (result.role !== role) {
        // role changed. update profile
        console.log('oAuth: role change detected');
        return Profile.findOne({ email });
      }
      // no change to profile
      done = true;
      const cookieOptions = { maxAge: 7 * 1000 * 60 * 60 * 24 };
      response.cookie('RaToken', raToken, cookieOptions);
      return response.redirect(process.env.CLIENT_URL);
    })
    .then((profile) => {
      
    })
    .catch(() => {
      // no account? Check Whitelist for the email
      console.log('oAuth: login failed, checking whitelist');
      return Whitelist.findOne({ email });
    })
    .then((result) => {
      console.log('oAuth: whitelist result', result);
      if (!result) {
        console.log('oAuth: returning status 401: Not Authorized');
        done = true;
        return response.sendStatus(401);
      }
      let { role } = result; //eslint-disable-line
      console.log('oAuth: email found in whitelist, creating account');
      return superagent.post(`${process.env.API_URL}/signup`)
        .send({ username, email, password })
        .withCredentials();
    })
    .then((result) => {
      if (!done) {
        console.log('oAuth: create account succeeded, creating profile');
        raToken = result.body.token;
        return superagent.post(`${process.env.API_URL}/profiles`)
          .set('Authorization', `Bearer ${raToken}`)
          .send({ 
            firstName, lastName, email, role, 
          });
      }
      return undefined;
    })
    .then(() => {
      if (!done) {
        console.log('oAuth: profile created, sending cookie and redirecting');
        const cookieOptions = { maxAge: 7 * 1000 * 60 * 60 * 24 };
        response.cookie('RaToken', raToken, cookieOptions);

        return response.redirect(process.env.CLIENT_URL);
      }
      return undefined;
    })
    .catch(next);
});

export default googleOAuthRouter;
