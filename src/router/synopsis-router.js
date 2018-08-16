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

  // oauth2Client.setCredentials(googleAccessToken);
  console.log('))))))))) synopsis router: typeof oAuth2Client', typeof oAuth2Client);
  console.log('))))))))) synopsis router: oAuth2Client:', oAuth2Client);

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

      console.log('>>>>>>>>> calling drive.files.create to create file: ', fileMetadata.name, 'into folder: ', setFolderName);
      result = await drive.files.create({
        resource: fileMetadata,
        requestBody,
        media,
      });
      console.log('>>>>>>>>> SUCCESS created file: ', fileMetadata.name, ' and placed into folder: ', setFolderName);
      return response.json(result);
    };

    try {
      const folderMetadata = {
        name: setFolderName,
        mimeType: 'application/vnd.google-apps.folder',
        fields: 'id',
      };
      console.log('>>>>>>>>> searching for folder: ', setFolderName);      
      drive.files.list({
        q: `name='${setFolderName}'`,
      }, (err, res) => {
        let folderId;
        if (err) {
          console.error(err);
        } else {
          if (res.data.files[0]) {
            folderId = res.data.files[0].id;
            console.log('>>>>>>>>> found folder: ', setFolderName);      
          } else {
            console.log('>>>>>>>>> NO found folder.\n>>>>>>>>>>>>>>Creating folder: ', setFolderName);                  
            return drive.files.create({
              resource: folderMetadata,
            }, (error, file) => {
              if (err) {
                // Handle error
                console.error(error);
              } else {
                folderId = file.data.id;
                console.log('>>>>>>>>> calling uploadFileToFolder');      
                return uploadFileToFolder(folderId);
              }
              return undefined;
            });
          }
          console.log('>>>>>>>>> calling uploadFileToFolder');                
          uploadFileToFolder(folderId);  
        }
        return response;        
      });
    } catch (err) {
      console.error('HITTING THE ERROR################', err);
      return next(new HttpError(err.status, 'Error saving PDF to google drive.', { expose: false }));
    }
    return undefined;
  }; // end of pdf.create callback
  
  pdf.create(html, options).toFile(`${TEMP_DIR}/${title}.pdf`,
    (err, res) => {
      if (err) return next(new HttpError(500, 'Error creating pdf from html'));
      console.log('>>>>>>>>>>Converting html to pdf\nPDF is stored here: ', res);
      return sendFileToGoogleDrive();
    });
});
  

export default synopsisRouter;


// ry {
//   const response = await superagent.post(`${apiUrl}/signup`)
//     .send(mockAccount);
//   console.log('test response.status', response.status);
//   console.log('test response.body', response.body);
//   expect(response.status).toEqual(200);
// } catch (err) {
//   expect(err).toEqual('Unexpected error testing good signup.');
// }
