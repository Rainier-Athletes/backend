'use strict';

const winston = require('winston');

const devLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: `${new Date().toDateString().replace(/ /g, '-')}.log`, 
      level: 'verbose', 
    }),
    new winston.transports.Console({ format: winston.format.simple(), level: 'info' }),
  ],
});

devLogger.INFO = 'info';
devLogger.ERROR = 'error';


module.exports = devLogger;
