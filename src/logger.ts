import path = require('path');
import winston = require('winston');

const logsdir = './logs';

export default winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'rides-service' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({ filename: path.join(logsdir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logsdir, 'combined.log') }),
  ],
});
