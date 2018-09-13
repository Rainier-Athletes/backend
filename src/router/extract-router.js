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
  
  // query the database and dump results to temp csv file
  let queryError = false;
  PointTracker.where('createdAt').gte(new Date(fromDate)).lte(new Date(toDate)).exec()
    .then((data) => {
      if (data.length === 0) {
        queryError = true;
        return next(new HttpError(404, `No data found in date range ${fromDate} to ${toDate}`, { expose: false }));
      }
      return PointTracker.csvReadStream(data)
        .pipe(fs.createWriteStream(`${TEMP_DIR}/${extractName}.csv`));
    })
    .then(() => {
      if (!queryError) return sendFileToGoogleDrive();
      return undefined;
    })
    .catch(next);

  return undefined;
});
  
export default extractRouter;
