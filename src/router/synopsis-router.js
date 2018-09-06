import { Router } from 'express';
import { google } from 'googleapis';
import HttpError from 'http-errors';
import fs from 'fs';
import pdf from 'html-pdf';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';

const cleanDate = () => {
  const dateObj = new Date();
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();
  const newDate = `${year}-${month}-${day}`;
  return newDate;
};

const TEMP_DIR = `${__dirname}/temp`;

const synopsisRouter = new Router();

synopsisRouter.post('/api/v1/synopsis', bearerAuthMiddleware, async (request, response, next) => {
  const name = typeof request.body.name === 'string' && request.body.name !== '' ? request.body.name : false;
  const html = typeof request.body.html === 'string' && request.body.html !== '' ? request.body.html : false;
  if (!(name && html)) return next(new HttpError(400, 'Missing or invalid name or html parameters on request body', { expose: false }));

  const date = cleanDate(); 
  const title = `${name} ${date}`;
  const { googleTokenResponse } = request;
  const setFolderName = `RA Reports for ${name}`;

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
    const filePath = `${TEMP_DIR}/${title}.pdf`;
    
    let readStream;
    try {
      readStream = fs.createReadStream(filePath);
    } catch (err) {
      logger(logger.ERROR, `Error creating readStream ${err}`);
      return next(new HttpError(500, `Error creating readStream ${err}`));
    }

    const uploadFileToFolder = async (folderId) => {    
      const fileMetadata = {
        name: `${title}.pdf`,
        writersCanShare: true,
        parents: [folderId],
      };

      const media = {
        mimeType: 'application/pdf',
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
        return next(new HttpError(500, `Unable to create PDF file on google drive: ${cerr}`, { expose: false }));
      }

      // if that worked get the file's metadata
      let metaData;
      try {
        metaData = await drive.files.get({ 
          fileId: result.data.id, 
          fields: 'webViewLink', 
        });
      } catch (gerr) {
        return next(new HttpError(500, `Unable to get PDF file info from google drive: ${gerr}`));
      }

      // delete the temp file and return our http response
      fs.unlink(`${TEMP_DIR}/${title}.pdf`, (derr) => {
        if (derr) return next(new HttpError(502, `PDF uploaded to google but unable to delete temp file: ${derr}`));

        // this is our success response:
        return response.json(metaData.data).status(200);
      });
      return undefined; // to satisfy linter
    };

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
        q: `name='${setFolderName}'`,
      }); 
    } catch (err) {
      logger(logger.ERROR, `Error retrieving drive file list ${err}`);
      return next(new HttpError(500, `Error retrieving drive file list ${err}`));
    }

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
        logger(logger.ERROR, `Error creating creating folder ${error}`);
        return next(new HttpError(500, `Error creating creating folder ${error}`));
      }
      folderId = file.data.id; 
    }

    return uploadFileToFolder(folderId);
  }; // end of sendFileToGoogleDrive
  
  pdf.create(html).toFile(`${TEMP_DIR}/${title}.pdf`,
    (err) => {
      if (err) return next(new HttpError(500, 'Error creating pdf from html', { expose: false }));
      return sendFileToGoogleDrive();
    });
});
  
export default synopsisRouter;
