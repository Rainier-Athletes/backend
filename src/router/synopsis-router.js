import { Router } from 'express';
import { google } from 'googleapis';
import HttpError from 'http-errors';
import fs from 'fs';
import pdf from 'html-pdf';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';

const cleanDate = () => {
  const dateObj = new Date();
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();
  const newDate = `${year}/${month}/${day}`;
  return newDate;
};

const TEMP_DIR = `${__dirname}/temp`;

const synopsisRouter = new Router();

synopsisRouter.post('/api/v1/synopsis', bearerAuthMiddleware, async (request, response, next) => {
  const { name } = request.body;
  const date = cleanDate(); 
  const title = `${name} ${date}`;
  const options = { format: request.body.options };
  const { html } = request.body;
  const { googleTokenResponse } = request;
  const setFolderName = `Rainier Athletes - ${name}`;

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
      console.error(err);
    }

    
    let result;
    const uploadFileToFolder = async (folderId) => {    
      const fileMetadata = {
        name: `${title}`,
        writersCanShare: true,
        parents: [folderId],
      };

      const requestBody = {
        name: `${title}.pdf`,
        mimeType: 'application/pdf',

      };
      const media = {
        mimeType: 'application/pdf',
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
          console.error(err);
        } else {
          if (res.data.files[0]) {
            folderId = res.data.files[0].id;      
          } else {
            return drive.files.create({
              resource: folderMetadata,
            }, (error, file) => {
              if (err) {
                // Handle error
                console.error(error);
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
  
  pdf.create(html, options).toFile(`${TEMP_DIR}/${title}.pdf`,
    (err) => {
      if (err) return next(new HttpError(500, 'Error creating pdf from html'));
      return sendFileToGoogleDrive();
    });
});
  

export default synopsisRouter;
