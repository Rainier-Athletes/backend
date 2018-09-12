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
import CsvBuilder from 'csv-builder';

import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';
import PointTracker from '../model/point-tracker';

const TEMP_DIR = `${__dirname}/temp`;

const extractRouter = new Router();

extractRouter.get('/api/v1/extract', bearerAuthMiddleware, async (request, response, next) => {
  const fromDate = request.query.from ? request.query.from : false;
  const toDate = request.query.to ? request.query.to : false;

  if (!(fromDate && toDate)) return new HttpError(400, 'Bad extract request. Missing to or from dates', { expose: false });

  const extractName = `point-tracker-extract-${fromDate}-${toDate}`;

  const { googleTokenResponse } = request;
  const setFolderName = 'Rainier Athletes Data Extracts';

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_ID,
    process.env.GOOGLE_OAUTH_SECRET,
    `${process.env.API_URL}/oauth/google email profile openid`,
  );

  // this is what the drive example does once it
  // has a token. sends the whole object to setCreds
  oAuth2Client.setCredentials(googleTokenResponse);

  const drive = google.drive({ version: 'v3', auth: oAuth2Client }); 
  
  // const sendFileToGoogleDrive = async () => {
  async function sendFileToGoogleDrive() {
    const filePath = `${TEMP_DIR}/${extractName}.csv`;

    let readStream;
    try {
      readStream = fs.createReadStream(filePath);
    } catch (err) {
      logger.log(logger.ERROR, `Error creating readStream ${err}`);
      return next(new HttpError(500, `Error creating readStream ${err}`));
    }

    const uploadFileToFolder = async (folderId) => {
      // once folder is created, upload csv file to it 
      const fileMetadata = {
        name: `${extractName}.csv`,
        writersCanShare: true,
        parents: [folderId],
      };

      const media = {
        mimeType: 'text/csv',
        body: readStream,
      };

      const params = {
        resource: fileMetadata,
        media,
      };

      let result;
      try {
        result = await drive.files.create(params);
      } catch (cerr) {
        return next(new HttpError(500, `Unable to create csv file on google drive: ${cerr}`, { expose: false }));
      }
      // now set permissions so a shareable link will work
      try {
        await drive.permissions.create({
          resource: {
            type: 'anyone',
            role: 'reader',
          },
          fileId: result.data.id,
          fields: 'id',
        });
      } catch (err) {
        return next(new HttpError(500, `permissions.create error: ${err}`));
      }
      // if that worked get the file's metadata
      let metaData;
      try {
        metaData = await drive.files.get({ 
          fileId: result.data.id, 
          fields: 'webViewLink', 
        });
      } catch (gerr) {
        return next(new HttpError(500, `Unable to get csv file info from google drive: ${gerr}`));
      }

      // delete the temp file and return our http response
      fs.unlink(`${TEMP_DIR}/${extractName}.csv`, (derr) => {
        if (derr) return next(new HttpError(502, `CSV uploaded to google but unable to delete temp file: ${derr}`));

        // this is our success response:
        return response.json(metaData.data).status(200);
      });
      return undefined; // to satisfy linter
    }; // end uploadFileToFolder

    let res;

    // see if extract folder exists
    const folderMetadata = {
      name: setFolderName,
      mimeType: 'application/vnd.google-apps.folder',
      fields: 'id',
    };
    try {
      res = await drive.files.list({ 
        mimeType: 'application/vnd.google-apps.folder',
        q: `name='${setFolderName}' and trashed = false`,
      }); 
    } catch (err) {
      logger.log(logger.ERROR, `Error retrieving drive file list ${err}`);
      // delete temp file then return error response
      fs.unlink(`${TEMP_DIR}/${extractName}.csv`, (derr) => {
        if (derr) return logger.log(`OAuth error as well as fs.unlink error: ${derr}`);
        return undefined;
      });      
      return next(new HttpError(401, 'Error retrieving drive file list. Likely bad OAuth.'));
    }
    // if we didn't catch an error above then oauth is good. Subsequent errors will be status 500
    let folderId;
    if (res.data.files[0]) {
      // folder exists
      folderId = res.data.files[0].id;     
    } else {  
      // create the folder
      let file;
      try {
        file = await drive.files.create({
          resource: folderMetadata,
        });
      } catch (error) {
        // Handle error
        logger.log(logger.ERROR, `Error creating creating folder ${error}`);
        return next(new HttpError(500, `Error creating creating folder ${error}`));
      }
      folderId = file.data.id; 
    }

    return uploadFileToFolder(folderId);
  } // end of sendFileToGoogleDrive
  
  const headers = ['date',
    'student.active',
    'student.firstName',
    'student.lastName',
    'student.email',
    'student.phone',
    'student.gender',
    'student.school',
    'mentorIsSubstitute',
    'mentor.firstName',
    'mentor.lastName',
    'surveyQuestions.mentorAttendedCheckin',
    'surveyQuestions.metFaceToFace', 
    'surveyQuestions.hadOtherCommunication',
    'surveyQuestions.hadNoCommunication',
    'surveyQuestions.scoreSheetTurnedIn',
    'surveyQuestions.scoreSheetLostOrIncomplete',
    'surveyQuestions.scoreSheetWillBeLate',
    'surveyQuestions.scoreSheetOther',
    'surveyQuestions.scoreSheetOtherReason',
    'surveyQuestions.synopsisInformationComplete',
    'surveyQuestions.synopsisInformationIncomplete',
    'surveyQuestions.synopsisCompletedByRaStaff',
    'synopsisComments.extraPlayingTime',
    'synopsisComments.mentorGrantedPlayingTime',
    'synopsisComments.studentActionItems',
    'synopsisComments.sportsUpdate',
    'synopsisComments.additionalComments',
    'subject.1',
    'subject.1.excusedDays',
    'subject.1.stamps',
    'subject.1.halfStamp',
    'subjects.1.tutorials',
    'subjects.1.grade',
    'subject.2',
    'subject.2.excusedDays',
    'subject.2.stamps',
    'subject.2.halfStamp',
    'subjects.2.tutorials',
    'subjects.2.grade',  
    'subject.3',
    'subject.3.excusedDays',
    'subject.3.stamps',
    'subject.3.halfStamp',
    'subjects.3.tutorials',
    'subjects.3.grade',  
    'subject.4',
    'subject.4.excusedDays',
    'subject.4.stamps',
    'subject.4.halfStamp',
    'subjects.4.tutorials',
    'subjects.4.grade',  
    'subject.5',
    'subject.5.excusedDays',
    'subject.5.stamps',
    'subject.5.halfStamp',
    'subjects.5.tutorials',
    'subjects.5.grade',  
    'subject.6',
    'subject.6.excusedDays',
    'subject.6.stamps',
    'subject.6.halfStamp',
    'subjects.6.tutorials',
    'subjects.6.grade',  
    'subject.7',
    'subject.7.excusedDays',
    'subject.7.stamps',
    'subject.7.halfStamp',
    'subjects.7.tutorials',
    'subjects.7.grade',
    'subject.8',
    'subject.8.excusedDays',
    'subject.8.stamps',
    'subject.8.halfStamp',
    'subjects.8.tutorials',
    'subjects.8.grade',
  ];

  const alias = {
    'subject.1': 'subjects[0].subjectName',
    'subject.1.excusedDays': 'subjects[0].scoring.excusedDays',
    'subject.1.stamps': 'subjects[0].scoring.stamps',
    'subject.1.halfStamp': 'subjects[0].scoring.halfStamp',
    'subject.1.tutorials': 'subjects[0].scoring.tutorials',
    'subject.1.grade': 'subjects[0].grade',
    'subject.2': 'subjects[1].subjectName',
    'subject.2.excusedDays': 'subjects[1].scoring.excusedDays',
    'subject.2.stamps': 'subjects[1].scoring.stamps',
    'subject.2.halfStamp': 'subjects[1].scoring.halfStamp',
    'subject.2.tutorials': 'subjects[1].scoring.tutorials',
    'subject.2.grade': 'subjects[1].grade',
    'subject.3': 'subjects[2].subjectName',
    'subject.3.excusedDays': 'subjects[2].scoring.excusedDays',
    'subject.3.stamps': 'subjects[2].scoring.stamps',
    'subject.3.halfStamp': 'subjects[2].scoring.halfStamp',
    'subject.3.tutorials': 'subjects[2].scoring.tutorials',
    'subject.3.grade': 'subjects[2].grade',
    'subject.4': 'subjects[3].subjectName',
    'subject.4.excusedDays': 'subjects[3].scoring.excusedDays',
    'subject.4.stamps': 'subjects[3].scoring.stamps',
    'subject.4.halfStamp': 'subjects[3].scoring.halfStamp',
    'subject.4.tutorials': 'subjects[3].scoring.tutorials',
    'subject.4.grade': 'subjects[3].grade',
    'subject.5': 'subjects[4].subjectName',
    'subject.5.excusedDays': 'subjects[4].scoring.excusedDays',
    'subject.5.stamps': 'subjects[4].scoring.stamps',
    'subject.5.halfStamp': 'subjects[4].scoring.halfStamp',
    'subject.5.tutorials': 'subjects[4].scoring.tutorials',
    'subject.5.grade': 'subjects[4].grade',
    'subject.6': 'subjects[5].subjectName',
    'subject.6.excusedDays': 'subjects[5].scoring.excusedDays',
    'subject.6.stamps': 'subjects[5].scoring.stamps',
    'subject.6.halfStamp': 'subjects[5].scoring.halfStamp',
    'subject.6.tutorials': 'subjects[5].scoring.tutorials',
    'subject.6.grade': 'subjects[5].grade',
    'subject.7': 'subjects[6].subjectName',
    'subject.7.excusedDays': 'subjects[6].scoring.excusedDays',
    'subject.7.stamps': 'subjects[6].scoring.stamps',
    'subject.7.halfStamp': 'subjects[6].scoring.halfStamp',
    'subject.7.tutorials': 'subjects[6].scoring.tutorials',
    'subject.7.grade': 'subjects[6].grade',
    'subject.8': 'subjects[7].subjectName',
    'subject.8.excusedDays': 'subjects[7].scoring.excusedDays',
    'subject.8.stamps': 'subjects[7].scoring.stamps',
    'subject.8.halfStamp': 'subjects[7].scoring.halfStamp',
    'subject.8.tutorials': 'subjects[7].scoring.tutorials',
    'subject.8.grade': 'subjects[7].grade',
  };

  const builder = new CsvBuilder({ headers, alias });

  // query the database and dump results to temp csv file
  PointTracker.where('createdAt').gte(new Date(fromDate)).lte(new Date(toDate))
  // PointTracker.where('createdAt').gte(fromDate).lte(toDate)
    .then((data) => {
      if (data.length === 0) return next(HttpError(404, 'No data found in specified range', { expose: false }));

      let csv = '';
      csv += builder.getHeaders();
      try {
        data.forEach((item) => {
          csv += builder.getRow(item);
        });
      } catch (err) {
        return next(new HttpError(500, `Error building csv string: ${err}`));
      }

      fs.open(`${TEMP_DIR}/${extractName}.csv`, 'wx', (oerr, fd) => {
        if (oerr) return next(HttpError(500, `Could not create temp csv file: ${oerr}`, { expose: false }));
        return fs.writeFile(fd, csv, (werr) => {
          if (werr) return next(HttpError(500, `Error writing to temp csv file: ${werr}`, { expose: false }));
          return fs.close(fd, (cerr) => {
            if (cerr) return next(HttpError(500, `Error closing temp csv file: ${cerr}`, { expose: false }));
            // push csv file to google drive and send response
            return sendFileToGoogleDrive(); 
          });
        });
      });
      return undefined;
    })
    .catch((err) => {
      return next(new HttpError(500, `Unknown server error: ${err}`));
    });
  return undefined;
});
  
export default extractRouter;
