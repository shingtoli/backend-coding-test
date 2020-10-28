import express = require('express');
import swaggerUi = require('swagger-ui-express');
import YAML = require('yamljs');
import sqlite3 = require('sqlite3');
import rides from './rides/routes';

const swaggerDocument = YAML.load('./docs/swagger.yaml');
const app = express();

export default (db: sqlite3.Database): express.Application => {
  app.get('/health', (req, res) => res.send('Healthy'));

  rides(app, db);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  return app;
};
