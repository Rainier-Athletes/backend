//
// extract-router
//
// This router handles requests for data from the mongo database. Its output
// is a csv file with data in the requested date range.
//
import { Router } from 'express';
import { google } from 'googleapis';
import HttpError from 'http-errors';
import uuid from 'uuid/v4';
import fs from 'fs';

import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import createGoogleDriveFunction from '../lib/googleDriveLib';
import PointTracker from '../model/point-tracker';
import StudentData from '../model/student-data';
import Profile from '../model/profile';

const extractRouter = new Router();

extractRouter.get('/api/v1/extract/:model?', bearerAuthMiddleware, async (request, response, next) => {
  const fromDate = request.query.from ? request.query.from : false;
  const toDate = request.query.to ? request.query.to : false;
  const model = request.params.model ? request.params.model : false;
  
  if (!(fromDate && toDate)) return next(new HttpError(400, 'Bad extract request. Missing to or from dates', { expose: false }));
  if (!model || !['pointstracker', 'studentdata', 'coachesreport'].includes(model)) return next(new HttpError(400, 'Missing or bad extract model'));
  
  const TEMP_FILE = `${__dirname}/${uuid()}.csv`; // deleted "/temp" to see if heroku likes it better.
  
  const extractModel = {
    pointstracker: PointTracker,
    studentdata: StudentData,
    coachesreport: Profile,
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
  
  const sendFileToGoogleDrive = createGoogleDriveFunction(drive, TEMP_FILE, extractName, folderName, response, next);

  if (model === 'coachesreport') {
    extractModel[model]
      .find({ role: 'coach' })
      .where('active').equals(true)
      .exec()
      .then((data) => {
        const coaches = data.filter(coach => coach.students.length);
        const extractData = {};
        for (let coach = 0; coach < coaches.length; coach++) {
          const coachName = `${coaches[coach].firstName} ${coaches[coach].lastName}`;
          extractData[coachName] = [];
          const { students } = coaches[coach];
          for (let student = 0; student < students.length; student++) {
            const pointTracker = students[student].studentData.lastPointTracker || {};
            const ptComments = pointTracker.synopsisComments || {};
            extractData[coachName][student] = {};
            extractData[coachName][student].student = `${students[student].firstName} ${students[student].lastName}`;
            extractData[coachName][student].earnedPlayingTime = pointTracker.earnedPlayingTime || '';
            extractData[coachName][student].mentorGrantedPlayingTime = pointTracker.mentorGrantedPlayingTime || '';
            extractData[coachName][student].mentorComments = ptComments.mentorGrantedPlayingTimeComments || '';
            extractData[coachName][student].sportsUpdate = ptComments.sportsUpdate || '';
            extractData[coachName][student].additionalComments = ptComments.additionalComments || '';
          }
        }
        
        let csv = '"coach"';
        const coachNames = Object.keys(extractData);
        const otherHeadings = Object.keys(extractData[coachNames[0]][0]);
        csv = otherHeadings.reduce((acc, curr) => `${acc}, "${curr}"`, csv);
        csv += '<br />';
        for (let coach = 0; coach < coachNames.length; coach++) {
          for (let player = 0; player < extractData[coachNames[coach]].length; player++) {
            csv += `"${coachNames[coach]}"`;
            for (let key = 0; key < otherHeadings.length; key++) {
              csv += `, "${extractData[coachNames[coach]][player][otherHeadings[key]]}"`;
            }
            csv += '<br />';
          }
        }
        return response.json({ csv }).status(200);
      })
      .catch(next);
  } else {
    // query the database and dump results to temp csv file
    let queryError = false;
    extractModel[model].where('createdAt').gte(fromDate).lte(toDate).exec()
      .then((data) => {
        if (data.length === 0) {
          queryError = true;
          return next(new HttpError(404, `No data found in date range ${fromDate} to ${toDate}`, { expose: false }));
        }
        try {
          extractModel[model].csvReadStream(data)
            .pipe(fs.createWriteStream(TEMP_FILE));
        } catch (err) {
          queryError = true;
          return next(new HttpError(500, `Server error creating ${TEMP_FILE}: ${err}`));
        }
        return undefined;
      })
      .then(() => {
        if (!queryError) return sendFileToGoogleDrive();
        return undefined;
      })
      .catch(next);
  }
  return undefined;
});
  
export default extractRouter;
