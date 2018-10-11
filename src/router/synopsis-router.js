import { Router } from 'express';
import { google } from 'googleapis';
import HttpError from 'http-errors';
import pdf from 'html-pdf';
import uuid from 'uuid/v4';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import createGoogleDriveFunction from '../lib/googleDriveLib';

const cleanDate = () => {
  const dateObj = new Date();
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();
  const newDate = `${year}-${month}-${day}`;
  return newDate;
};

const synopsisRouter = new Router();

synopsisRouter.post('/api/v1/synopsis', bearerAuthMiddleware, async (request, response, next) => {
  const name = typeof request.body.name === 'string' && request.body.name !== '' ? request.body.name : false;
  const html = typeof request.body.html === 'string' && request.body.html !== '' ? request.body.html : false;
  if (!(name && html)) return next(new HttpError(400, 'Missing or invalid name or html parameters on request body', { expose: false }));

  const date = cleanDate(); 
  const title = `${name} ${date}.pdf`;
  const { googleTokenResponse } = request;
  const setFolderName = `RA Reports for ${name}`;
  const TEMP_FILE = `${__dirname}/${uuid()}.pdf`;

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_ID,
    process.env.GOOGLE_OAUTH_SECRET,
    `${process.env.API_URL}/oauth/google email profile openid`,
  );

  // this is what the drive example does once it
  // has a token. sends the whole object to setCreds
  oAuth2Client.setCredentials(googleTokenResponse);

  const drive = google.drive({ version: 'v3', auth: oAuth2Client }); 
  
  const sendFileToGoogleDrive = createGoogleDriveFunction(drive, TEMP_FILE, title, setFolderName, response, next);

  pdf.create(html).toFile(TEMP_FILE,
    (err) => {
      if (err) return next(new HttpError(500, 'Error creating pdf from html', { expose: false }));
      return sendFileToGoogleDrive();
    });

  return undefined; // to satisfy linter...
});
  
export default synopsisRouter;
