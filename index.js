const port = 8010;

const sqlite3 = require('sqlite3').verbose();

const buildSchemas = require('./src/schemas');
const logger = require('./src/logger');

const initialiseApp = require('./src/app');

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  buildSchemas(db);

  const app = initialiseApp(db);

  app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});
