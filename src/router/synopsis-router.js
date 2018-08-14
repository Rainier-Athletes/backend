import { Router } from 'express';
import { google } from 'googleapis';
import superagent from 'superagent';
import fs from 'fs';
import pdf from 'html-pdf';
import bearerAuthMiddleware from '../lib/middleware/bearer-auth-middleware';

const GOOGLE_DRIVE_API = 'https://www.googleapis.com/upload/drive/v3/files/';
// const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const synopsisRouter = new Router();

synopsisRouter.post('/api/v1/synopsis', bearerAuthMiddleware, async (request, response, next) => {
  const { name } = request.body;
  const { date } = request.body; 
  const title = (name + date);
  const options = { format: request.body.options };
  const { html } = request.body;
  const { googleToken } = request.account;
  const drive = google.drive({ version: 'v3', googleToken });

  pdf.create(html, options).toFile(`temp/${title}.pdf`, (err, res) => {
    if (err) return console.log(err);
    return response.json(res);
  });

  const filePath = `temp/${title}.pdf`;
  const fileMetadata = {
    name: `${title}.pdf`,
  };
  
  const media = {
    mimeType: 'image/pdf',
    body: fs.createReadStream(filePath),
  };
  
  drive.files.create({
    setOauthToken: googleToken,
    resource: fileMetadata,
    media,
  }, (err, file) => {
    if (err) {
      // Handle error
      console.error('HITTING THE ERROR################', err);
    } else {
      console.log('File Id: ', file.id);
    }
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
