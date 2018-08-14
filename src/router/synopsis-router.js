import { Router } from 'express';
import { google } from 'googleapis';
import superagent from 'superagent';
import fs from 'fs';
import pdf from 'html-pdf';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';
import logger from '../lib/logger';

const GOOGLE_DRIVE_API = 'https://www.googleapis.com/upload/drive/v3/files/';
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
  const { googleAccessToken, googleIdToken } = request.body;

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
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_ID,
    process.env.GOOGLE_OAUTH_SECRET,
    'http://localhost:3000/api/v1/oauth/google',
  );

  const drive = google.drive({ version: 'v2', auth: oauth2Client });

  // const drive = google.drive({ version: 'v3', auth: googleAccessToken });
  

  console.log('&&&&&&&&&&&&& synopsis router request.googleAccessToken', request.googleAccessToken);
  pdf.create(html, options).toFile(`${TEMP_DIR}/${title}.pdf`, (err, res) => {
    if (err) return next(err);
    return response.json(res);
  });

  const filePath = `${TEMP_DIR}/${title}.pdf`;
  const fileMetadata = {
    name: `${title}.pdf`,
  };
  
  let readStream;
  try {
    readStream = fs.createReadStream(filePath);
  } catch (err) {
    console.log('&&&&&&&&&& fs.createReadStream error:');
    console.error(err);
    console.log('&&&&&&&&& end of error');
  }
  const requestBody = {
    name: `${title}.pdf`,
    mimeType: 'application/pdf', 
  };
  const media = {
    mimeType: 'application/pdf',
    body: readStream,
  };
  /* 
  
  const res = await drive.files.create({
    requestBody: {
      name: 'testimage.png',
      mimeType: 'image/png'
    },
    media: {
      mimeType: 'image/png',
      body: fs.createReadStream('awesome.png')
    }
  });
  */

  let result;
  try {
    result = await drive.files.create({
      requestBody,
      media,
    });
  } catch (err) {
    console.error('HITTING THE ERROR################', err);
    return next(new HttpError(err.status, 'Error saving PDF to google drive.', { expose: false }));
  }
  console.log('File Id: ', result.id);
  return response.json(result);
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
