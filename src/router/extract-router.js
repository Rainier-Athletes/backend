//
// extract-router
//
// This router handles requests for data from the mongo database. Its output
// is a csv file with data in the requested date range.
//
import { Router } from 'express';
import { google } from 'googleapis';
import HttpError from 'http-errors';
import fs from 'fs';

import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import createGoogleDriveFunction from '../lib/googleDriveLib';
import PointTracker from '../model/point-tracker';
import StudentData from '../model/student-data';

const TEMP = `${__dirname}/temp`;

const extractRouter = new Router();

extractRouter.get('/api/v1/extract/:model?', bearerAuthMiddleware, async (request, response, next) => {
  const fromDate = request.query.from ? request.query.from : false;
  const toDate = request.query.to ? request.query.to : false;
  const model = request.params.model ? request.params.model : false;

  if (!(fromDate && toDate)) return next(new HttpError(400, 'Bad extract request. Missing to or from dates', { expose: false }));
  if (!model || !['pointstracker', 'studentdata'].includes(model)) return next(new HttpError(400, 'Missing or bad extract model'));

  const extractModel = {
    pointstracker: PointTracker,
    studentdata: StudentData,
  };

  const extractName = `${model}-extract-${fromDate}-${toDate}.csv`;

  const { googleTokenResponse } = request;
  const folderName = 'Rainier Athletes Data Extracts';

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_ID,
    process.env.GOOGLE_OAUTH_SECRET,
    `${process.env.API_URL}/oauth/google email profile openid`,
  );

  // this is what the drive example does once it
  // has a token. sends the whole object to setCreds
  oAuth2Client.setCredentials(googleTokenResponse);

  const drive = google.drive({ version: 'v3', auth: oAuth2Client }); 
  
  const sendFileToGoogleDrive = createGoogleDriveFunction(drive, TEMP, extractName, folderName, response, next);

  // query the database and dump results to temp csv file
  let queryError = false;
  extractModel[model].where('createdAt').gte(new Date(fromDate)).lte(new Date(toDate)).exec()
    .then((data) => {
      if (data.length === 0) {
        queryError = true;
        return next(new HttpError(404, `No data found in date range ${fromDate} to ${toDate}`, { expose: false }));
      }
      return extractModel[model].csvReadStream(data)
        .pipe(fs.createWriteStream(`${TEMP}/${extractName}`));
    })
    .then(() => {
      if (!queryError) return sendFileToGoogleDrive();
      return undefined;
    })
    .catch(next);

  return undefined;
});
  
export default extractRouter;
