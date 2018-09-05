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
// import CsvBuilder from 'csv-builder';
import Json2csvParser from 'json2csv';

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
  }; // end of pdf.create callback
  
  console.log('extract get calling PointTracker.find with', fromDate, toDate);
  // Model.where('created').gte(twoWeeksAgo).stream().pipe(writeStream);
  // const builder = new CsvBuilder({ headers: ['mentorAttendedCheckin',
  //   'metFaceToFace', 'hadOtherCommunication'],
  // });

  const fields = ['date',
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
  ];

  // const fields = ['student.studentData.firstName'];
  const opts = { fields }; // , unwind: ['student.studentData'], unwindBlank: true };
  const parser = new Json2csvParser.Parser(opts);
 
  PointTracker.where('createdAt').gte(new Date(fromDate)).lte(new Date(toDate))
    .then((data) => {
      // console.log(JSON.stringify(data));
      try {
        data.forEach((item) => {
          console.log(item);
          // const json = JSON.stringify(item);
          // console.log(json);
          const csv = parser.parse(item);
          console.log(csv);
          // fs.writeFileSync(`${TEMP_DIR}/${extractName}.csv`, csv);
        });
      } catch (err) {
        console.error(err);
      }
      response.sendStatus(200);
    })
    .catch(console.error);
  // PointTracker.where({
  //   createdAt: {
  //     $gte: new Date(fromDate),
  //     $lte: new Date(toDate),
  //   },
  // }).pipe(fs.createWriteStream(`${extractName}.csv`))
    // .exec()
    // .then((docs) => {
    //   console.log(docs);
    //   PointTracker.csvReadStream(docs)
    //     .pipe(fs.createWriteStream(`${extractName}.csv`));
    // })
    // .then(() => {
    //   response.sendStatus(200);
    // })
    // .catch((err) => {
    //   console.error(err);
    // });

  // PointTracker.find({})
  //   .where('createdAt').gte(fromDate).lte(toDate)
  //   .stream()
  //   .pipe(PointTracker.csvTransformStream())
  //   .pipe(fs.createWriteStream(`${extractName}.csv`))
  //   .pipe(sendFileToGoogleDrive())
  //   .pipe(response.sendStatus(200));
});
  

export default extractRouter;
