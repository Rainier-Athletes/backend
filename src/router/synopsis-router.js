import { Router } from 'express';
import { google } from 'googleapis';
// import superagent from 'superagent';
import HttpError from 'http-errors';
import fs from 'fs';
import pdf from 'html-pdf';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
// import logger from '../lib/logger';

// const GOOGLE_DRIVE_API = 'https://www.googleapis.com/upload/drive/v3/files/';
// const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const TEMP_DIR = `${__dirname}/temp`;

const synopsisRouter = new Router();

synopsisRouter.post('/api/v1/synopsis', bearerAuthMiddleware, async (request, response, next) => {
  console.log('&&&&&&&&&& in POST api/v1/synopsis');
  const { name } = request.body;
  const { date } = request.body; 
  const title = (name + date);
  const options = { format: request.body.options };
  const { html } = request.body;
  const { googleTokenResponse } = request;

  console.log('))))))))) synopsis googleTokenResponse', googleTokenResponse);

  /*
  const oauth2Client = new google.auth.OAuth2(
    YOUR_CLIENT_ID,
    YOUR_CLIENT_SECRET,
    YOUR_REDIRECT_URL
  );
  
  const drive = google.drive({
    version: 'v2',
    auth: oauth2Client
  });
  */
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_ID,
    process.env.GOOGLE_OAUTH_SECRET,
    'http://localhost:3000/api/v1/oauth/google email profile openid',
  );

  // this is what the drive example does once it
  // has a token. sends the whole object to setCreds
  oAuth2Client.setCredentials(googleTokenResponse);

  // oauth2Client.setCredentials(googleAccessToken);
  console.log('))))))))) synopsis router: typeof oAuth2Client', typeof oAuth2Client);
  console.log('))))))))) synopsis router: oAuth2Client:', oAuth2Client);

  const drive = google.drive({ version: 'v3', auth: oAuth2Client }); 

  // const drive = google.drive({ version: 'v3', auth: googleAccessToken });
  

  console.log('&&&&&&&&&&&&& synopsis router request.googleAccessToken', request.googleAccessToken);

  const sendFileToGoogleDrive = async () => {
    console.log('>>>>>>>> sendFileToGoogleDrive entered');
    const filePath = `${TEMP_DIR}/${title}.pdf`;
    
    let readStream;
    try {
      readStream = fs.createReadStream(filePath);
    } catch (err) {
      console.log('&&&&&&&&&& fs.createReadStream error:');
      console.error(err);
      console.log('&&&&&&&&& end of error');
    }
    console.log('>>>>>>> readStream created');
    const requestBody = {
      name: `${title}.pdf`,
      mimeType: 'application/pdf', 
    };
    const media = {
      mimeType: 'application/pdf',
      body: readStream,
    };

    let result;
    try {
      console.log('>>>>>>>>> calling drive.files.create');
      result = await drive.files.create({
        requestBody,
        media,
      });
      console.log('>>>>>>>> back from drive.files.create');
    } catch (err) {
      console.error('HITTING THE ERROR################', err);
      return next(new HttpError(err.status, 'Error saving PDF to google drive.', { expose: false }));
    }
    console.log('>>>>>>>>>>> result from drive.file.create:', result);
    return response.json(result);
  }; // end of pdf.create callback
  
  pdf.create(html, options).toFile(`${TEMP_DIR}/${title}.pdf`,
    (err, res) => {
      if (err) return next(new HttpError(500, 'Error creating pdf from html'));
      console.log('html-pdf response', res);
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
