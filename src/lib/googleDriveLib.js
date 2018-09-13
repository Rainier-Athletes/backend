
import HttpError from 'http-errors';
import fs from 'fs';

import logger from './logger';

// common code used by extract-router and synopsys-router to send file to google drive
// const sendFileToGoogleDrive = async () => {
const createGoogleDriveFunction = (drive, TEMP_DIR, extractName, folderName, response, next) => async () => {
  const filePath = `${TEMP_DIR}/${extractName}`;

  let readStream;
  try {
    readStream = fs.createReadStream(filePath);
  } catch (err) {
    logger.log(logger.ERROR, `Error creating readStream ${err}`);
    return next(new HttpError(500, `Error creating readStream ${err}`));
  }

  const uploadFileToFolder = async (folderId) => {
    // once folder is created, upload file to it 
    const fileMetadata = {
      name: `${extractName}`,
      writersCanShare: true,
      parents: [folderId],
    };

    const media = {
      mimeType: extractName.indexOf('.csv') > 0 ? 'text/csv' : 'application/pdf',
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
      return next(new HttpError(500, `Unable to create file on google drive: ${cerr}`, { expose: false }));
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
      return next(new HttpError(500, `Unable to get file info from google drive: ${gerr}`));
    }

    // delete the temp file and return our http response
    fs.unlink(`${TEMP_DIR}/${extractName}`, (derr) => {
      if (derr) return next(new HttpError(502, `File uploaded to google but unable to delete temp file: ${derr}`));

      // this is our success response:
      return response.json(metaData.data).status(200);
    });
    return undefined; // to satisfy linter
  }; // end uploadFileToFolder

  let res;

  // see if extract folder exists
  const folderMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    fields: 'id',
  };
  try {
    res = await drive.files.list({ 
      mimeType: 'application/vnd.google-apps.folder',
      q: `name='${folderName}' and trashed = false`,
    }); 
  } catch (err) {
    logger.log(logger.ERROR, `Error retrieving drive file list ${err}`);
    // delete temp file then return error response
    fs.unlink(`${TEMP_DIR}/${extractName}`, (derr) => {
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
}; // end of sendFileToGoogleDrive

export default createGoogleDriveFunction;
