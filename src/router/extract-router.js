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
// import Json2csvParser from 'json2csv';
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
  
  const sendFileToGoogleDrive = async () => {
    const filePath = `${TEMP_DIR}/${extractName}.csv`;
    
    console.log('sendFileToGoogleDrive from to', fromDate, toDate);

    let readStream;
    try {
      readStream = fs.createReadStream(filePath);
    } catch (err) {
      logger(logger.ERROR, `Error creating readStream ${err}`);
    }

    
    let result;
    const uploadFileToFolder = async (folderId) => {    
      const fileMetadata = {
        name: `${extractName}`,
        writersCanShare: true,
        parents: [folderId],
      };

      const requestBody = {
        name: `${extractName}.csv`,
        mimeType: 'text/csv',

      };
      const media = {
        mimeType: 'text/csv',
        body: readStream,
      };

      result = await drive.files.create({
        resource: fileMetadata,
        requestBody,
        media,
      });
      return response.json(result);
    };

    try {
      const folderMetadata = {
        name: setFolderName,
        mimeType: 'application/vnd.google-apps.folder',
        fields: 'id',
      };     
      drive.files.list({
        q: `name='${setFolderName}'`,
      }, (err, res) => {
        let folderId;
        if (err) {
          logger(logger.ERROR, `Error retrieving drive file list ${err}`);
        } else {
          if (res.data.files[0]) {
            folderId = res.data.files[0].id;      
          } else {
            return drive.files.create({
              resource: folderMetadata,
            }, (error, file) => {
              if (err) {
                // Handle error
                logger(logger.ERROR, `Error creating creating folder ${err}`);
              } else {
                folderId = file.data.id;      
                return uploadFileToFolder(folderId);
              }
              return undefined;
            });
          }                
          uploadFileToFolder(folderId);  
        }
        return response;        
      });
    } catch (err) {
      return next(new HttpError(err.status, 'Error saving PDF to google drive.', { expose: false }));
    }
    return undefined;
  }; // end of sendFileToGoogleDrive
  
  console.log('extract get calling PointTracker.find with', fromDate, toDate);
  // Model.where('created').gte(twoWeeksAgo).stream().pipe(writeStream);
  // const builder = new CsvBuilder({ headers: ['mentorAttendedCheckin',
  //   'metFaceToFace', 'hadOtherCommunication'],
  // });

  // const fields = ['date',
  //   'student.active',
  //   'student.firstName',
  //   'student.lastName',
  //   'student.email',
  //   'student.phone',
  //   'student.gender',
  //   'student.school',
  //   'surveyQuestions.mentorAttendedCheckin',
  //   'surveyQuestions.metFaceToFace', 
  //   'surveyQuestions.hadOtherCommunication',
  //   'surveyQuestions.hadNoCommunication',
  //   'surveyQuestions.scoreSheetTurnedIn',
  //   'surveyQuestions.scoreSheetLostOrIncomplete',
  //   'surveyQuestions.scoreSheetWillBeLate',
  //   'surveyQuestions.scoreSheetOther',
  //   'surveyQuestions.scoreSheetOtherReason',
  //   'surveyQuestions.synopsisInformationComplete',
  //   'surveyQuestions.synopsisInformationIncomplete',
  //   'surveyQuestions.synopsisCompletedByRaStaff',
  //   'synopsisComments.extraPlayingTime',
  //   'synopsisComments.mentorGrantedPlayingTime',
  //   'synopsisComments.studentActionItems',
  //   'synopsisComments.sportsUpdate',
  //   'synopsisComments.additionalComments',
  //   'subjects.subjectName',
  //   'subjects.excusedDays',
  //   'subjects.stamps',
  //   'subjects.halfStamp',
  //   'subjects.tutorials',
  //   'subjects.grade',
  // ];

  const headers = ['date',
    'student.active',
    'student.firstName',
    'student.lastName',
    'student.email',
    'student.phone',
    'student.gender',
    'student.school',
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
    'subject.1.excusedDays': 'subjects[0].excusedDays',
    'subject.1.stamps': 'subjects[0].stamps',
    'subject.1.halfStamp': 'subjects[0].halfStamp',
    'subject.1.tutorials': 'subjects[0].tutorials',
    'subject.1.grade': 'subjects[0].grade',
    'subject.2': 'subjects[1].subjectName',
    'subject.2.excusedDays': 'subjects[1].excusedDays',
    'subject.2.stamps': 'subjects[1].stamps',
    'subject.2.halfStamp': 'subjects[1].halfStamp',
    'subject.2.tutorials': 'subjects[1].tutorials',
    'subject.2.grade': 'subjects[1].grade',
    'subject.3': 'subjects[2].subjectName',
    'subject.3.excusedDays': 'subjects[2].excusedDays',
    'subject.3.stamps': 'subjects[2].stamps',
    'subject.3.halfStamp': 'subjects[2].halfStamp',
    'subject.3.tutorials': 'subjects[2].tutorials',
    'subject.3.grade': 'subjects[2].grade',
    'subject.4': 'subjects[3].subjectName',
    'subject.4.excusedDays': 'subjects[3].excusedDays',
    'subject.4.stamps': 'subjects[3].stamps',
    'subject.4.halfStamp': 'subjects[3].halfStamp',
    'subject.4.tutorials': 'subjects[3].tutorials',
    'subject.4.grade': 'subjects[3].grade',
    'subject.5': 'subjects[4].subjectName',
    'subject.5.excusedDays': 'subjects[4].excusedDays',
    'subject.5.stamps': 'subjects[4].stamps',
    'subject.5.halfStamp': 'subjects[4].halfStamp',
    'subject.5.tutorials': 'subjects[4].tutorials',
    'subject.5.grade': 'subjects[4].grade',
    'subject.6': 'subjects[5].subjectName',
    'subject.6.excusedDays': 'subjects[5].excusedDays',
    'subject.6.stamps': 'subjects[5].stamps',
    'subject.6.halfStamp': 'subjects[5].halfStamp',
    'subject.6.tutorials': 'subjects[5].tutorials',
    'subject.6.grade': 'subjects[5].grade',
    'subject.7': 'subjects[6].subjectName',
    'subject.7.excusedDays': 'subjects[6].excusedDays',
    'subject.7.stamps': 'subjects[6].stamps',
    'subject.7.halfStamp': 'subjects[6].halfStamp',
    'subject.7.tutorials': 'subjects[6].tutorials',
    'subject.7.grade': 'subjects[6].grade',
    'subject.8': 'subjects[7].subjectName',
    'subject.8.excusedDays': 'subjects[7].excusedDays',
    'subject.8.stamps': 'subjects[7].stamps',
    'subject.8.halfStamp': 'subjects[7].halfStamp',
    'subject.8.tutorials': 'subjects[7].tutorials',
    'subject.8.grade': 'subjects[7].grade',
  };

  const builder = new CsvBuilder({ headers, alias });

  // const fields = ['student.studentData.firstName'];
  // const opts = { fields, unwind: ['subjects'], unwindBlank: true };
  // const parser = new Json2csvParser.Parser(opts);
 
  PointTracker.where('createdAt').gte(new Date(fromDate)).lte(new Date(toDate))
    .then((data) => {
      // console.log(JSON.stringify(data));
      let csv = '';
      csv += builder.getHeaders();
      try {
        data.forEach((item) => {
          // console.log(item);
          // const json = JSON.stringify(item);
          // console.log(json);
          // const csv = parser.parse(item);
          csv += builder.getRow(item);
        });
        console.log(csv);
        console.log('opening file', `${TEMP_DIR}/${extractName}.csv`);
        fs.open(`${TEMP_DIR}/${extractName}.csv`, 'wx', (oerr, fd) => {
          if (oerr) return console.error('error creating file', oerr); // new HttpError(500, 'Could not create temp csv file', { expose: false });
          console.log('writing file');
          return fs.writeFile(fd, csv, (werr) => {
            if (werr) return new HttpError(500, 'Error writing to temp csv file', { expose: false });
            console.log('closing file');
            return fs.close(fd, (cerr) => {
              if (cerr) return new HttpError(500, 'Error closing temp csv file', { expose: false });
              console.log('calling sendFileToGoogleDrive');
              return sendFileToGoogleDrive();
            });
          });
        });
      } catch (err) {
        console.error(err);
      }
      response.sendStatus(200);
    })
    .catch(console.error);
  return undefined;
});
  
export default extractRouter;
