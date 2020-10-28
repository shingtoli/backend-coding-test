import bodyParser = require('body-parser');
import { Application } from 'express';
import { Database } from 'sqlite3';
import { createRide, fetchRides, getRideById } from './controller';

const jsonParser = bodyParser.json();

export default (app: Application, db: Database): Application => {
  app.post('/rides', jsonParser, createRide(db));
  app.get('/rides', fetchRides(db));
  app.get('/rides/:id', getRideById(db));

  return app;
};
