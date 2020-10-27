const port = 8010;

import { Database } from 'sqlite3';

import buildSchemas from './src/schemas';
import logger from './src/logger';

import initialiseApp from './src/app';

const db = new Database(':memory:');

db.serialize(() => {
  buildSchemas(db);

  const app = initialiseApp(db);

  app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});
