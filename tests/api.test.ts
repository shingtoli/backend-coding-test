import { expect } from 'chai';
import sinon = require('sinon');
import request = require('supertest');

import { Database } from 'sqlite3';
import { Application } from 'express';

import initialiseApp from '../src/app';
import buildSchemas from '../src/schemas';

describe('API tests', () => {
  let db: Database;
  let app: Application;

  const rideData = [
    {
      rideID: 1,
      startLat: 1.2832375,
      startLong: 103.8410841,
      endLat: 1.3841121,
      endLong: 103.7364912,
      riderName: 'Adam Smith',
      driverName: 'Alexander Potemkin',
      driverVehicle: 'Lada Xray',
      created: '2020-10-26 13:46:39',
    },
    {
      rideID: 2,
      startLat: 1.2498028,
      startLong: 103.829944,
      endLat: 1.2779591,
      endLong: 103.8644958,
      riderName: 'Douglas MacArthur',
      driverName: 'Pyotr Tchaikovsky',
      driverVehicle: 'Marussia B2',
      created: '2020-10-26 13:53:11',
    },
    {
      rideID: 3,
      startLat: 1.2954129,
      startLong: 103.8606506,
      endLat: 1.3468219,
      endLong: 103.6846386,
      riderName: 'Frank Sinatra',
      driverName: 'Garry Kasparov',
      driverVehicle: 'Fiat 500',
      created: '2020-10-27 22:33:21',
    },
  ];

  /**
   *
   * @param {Array<object>} rideData
   */
  const insertMany = (rides, callback) => {
    const statement = db.prepare('INSERT INTO Rides(rideID, startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    rides.forEach((ride) => {
      const {
        rideID, startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle, created,
      } = ride;
      statement.run(
        rideID, startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle, created,
      );
    });
    statement.finalize(callback);
  };

  before((done) => {
    db = new Database(':memory:');
    db.serialize(() => {
      buildSchemas(db);

      return done();
    });
    app = initialiseApp(db);
  });

  beforeEach((done) => {
    db.run('DELETE FROM Rides', done);
  });

  after((done) => {
    db.close((err) => {
      if (err) {
        done(err);
        return;
      }

      done();
    });
  });

  describe('POST /rides', () => {
    const rideRequest = {
      start_lat: 1.2832375,
      start_long: 103.8410841,
      end_lat: 1.3841121,
      end_long: 103.7364912,
      rider_name: 'Adam Smith',
      driver_name: 'Alexander Potemkin',
      driver_vehicle: 'Lada Xray',
    };

    it('should insert new ride into database', (done) => {
      const requestBody = { ...rideRequest };
      const expectedResponse = [rideData[0]];

      request(app)
        .post('/rides')
        .send(requestBody)
        .set('Accept', 'application/json')
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .end((err, response) => {
          expectedResponse[0].created = response.body[0].created;
          expect(response.body).to.eql(expectedResponse);
          done();
        });
    });

    it('should return validation error when start position is invalid', (done) => {
      const requestBody = { ...rideRequest, start_lat: -91.2 };

      const expectedResponse = {
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      };

      request(app)
        .post('/rides')
        .send(requestBody)
        .set('Accept', 'application/json')
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .end((err, response) => {
          expect(response.body).to.eql(expectedResponse);
          done();
        });
    });

    it('should return validation error when end position is invalid', (done) => {
      const requestBody = { ...rideRequest, end_long: 181.1 };

      const expectedResponse = {
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      };

      request(app)
        .post('/rides')
        .send(requestBody)
        .set('Accept', 'application/json')
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .end((err, response) => {
          expect(response.body).to.eql(expectedResponse);
          done();
        });
    });

    it('should return validation error when rider name is invalid', (done) => {
      const requestBody = { ...rideRequest, rider_name: 42 };

      const expectedResponse = {
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      };

      request(app)
        .post('/rides')
        .send(requestBody)
        .set('Accept', 'application/json')
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .end((err, response) => {
          expect(response.body).to.eql(expectedResponse);
          done();
        });
    });

    it('should return validation error when driver name is invalid', (done) => {
      const requestBody = { ...rideRequest, driver_name: false };

      const expectedResponse = {
        error_code: 'VALIDATION_ERROR',
        message: 'Driver name must be a non empty string',
      };

      request(app)
        .post('/rides')
        .send(requestBody)
        .set('Accept', 'application/json')
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .end((err, response) => {
          expect(response.body).to.eql(expectedResponse);
          done();
        });
    });

    it('should return validation error when driver vehicle is invalid', (done) => {
      const requestBody = { ...rideRequest, driver_vehicle: {} };

      const expectedResponse = {
        error_code: 'VALIDATION_ERROR',
        message: 'Driver vehicle must be a non empty string',
      };

      request(app)
        .post('/rides')
        .send(requestBody)
        .set('Accept', 'application/json')
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .end((err, response) => {
          expect(response.body).to.eql(expectedResponse);
          done();
        });
    });

    it('should return server error on any insert error', (done) => {
      const requestBody = { ...rideRequest };
      const expectedResponse = {
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      };

      const dbStub = sinon.stub(db, 'run');
      dbStub.yields({ error: 'someerror' });

      request(app)
        .post('/rides')
        .send(requestBody)
        .set('Accept', 'application/json')
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .end((err, response) => {
          expect(response.body).to.eql(expectedResponse);
          dbStub.restore();
          done();
        });
    });

    it('should return server error on any read error', (done) => {
      const requestBody = { ...rideRequest };
      const expectedResponse = {
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      };

      const dbStub = sinon.stub(db, 'all');
      dbStub.yields({ error: 'someerror' });

      request(app)
        .post('/rides')
        .send(requestBody)
        .set('Accept', 'application/json')
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .end((err, response) => {
          expect(response.body).to.eql(expectedResponse);
          dbStub.restore();
          done();
        });
    });
  });

  describe('GET /rides', () => {
    it('should return all rides', (done) => {
      const expectedResponse = rideData;

      insertMany(rideData, () => {
        request(app)
          .get('/rides')
          .expect('Content-Type', /^application\/json/)
          .expect(200)
          .then((response) => {
            expect(response.body).to.eql(expectedResponse);
            done();
          });
      });
    });

    it('should return only 2 rides', (done) => {
      const expectedResponse = [rideData[0], rideData[1]];

      insertMany(rideData, () => {
        request(app)
          .get('/rides?limit=2')
          .expect('Content-Type', /^application\/json/)
          .expect(200)
          .then((response) => {
            expect(response.body).to.eql(expectedResponse);
            done();
          });
      });
    });

    it('should return query error if offset is provided without limit', (done) => {
      const expectedResponse = {
        error_code: 'QUERY_ERROR',
        message: 'Offset must be provided with limit',
      };

      insertMany(rideData, () => {
        request(app)
          .get('/rides?offset=3')
          .expect('Content-Type', /^application\/json/)
          .expect(200)
          .then((response) => {
            expect(response.body).to.eql(expectedResponse);
            done();
          });
      });
    });

    it('should return only the third ride with limit and offset', (done) => {
      const expectedResponse = [rideData[2]];

      insertMany(rideData, () => {
        request(app)
          .get('/rides?limit=1&offset=2')
          .expect('Content-Type', /^application\/json/)
          .expect(200)
          .then((response) => {
            expect(response.body).to.eql(expectedResponse);
            done();
          });
      });
    });

    it('should return rides not found when limit and offset are out of range', (done) => {
      const expectedResponse = {
        error_code: 'RIDES_NOT_FOUND_ERROR',
        message: 'Could not find any rides',
      };
      insertMany(rideData, () => {
        request(app)
          .get('/rides?limit=5&offset=3')
          .expect('Content-Type', /^application\/json/)
          .expect(200)
          .then((response) => {
            expect(response.body).to.eql(expectedResponse);
            done();
          });
      });
    });

    it('should return rides not found when empty', (done) => {
      const expectedResponse = {
        error_code: 'RIDES_NOT_FOUND_ERROR',
        message: 'Could not find any rides',
      };
      request(app)
        .get('/rides')
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .then((response) => {
          expect(response.body).to.eql(expectedResponse);
          done();
        });
    });

    it('should return server error on any db error', (done) => {
      const expectedResponse = {
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      };

      const dbStub = sinon.stub(db, 'all');
      dbStub.yields({ error: 'someerror' });

      request(app)
        .get('/rides')
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .then((response) => {
          expect(response.body).to.eql(expectedResponse);

          dbStub.restore();
          done();
        });
    });
  });

  describe('GET /rides/{id}', () => {
    it('should return only ride of given rideID', (done) => {
      const selectedRideID = 2;
      const expectedResponse = [rideData[1]];

      insertMany(rideData, () => {
        request(app)
          .get(`/rides/${selectedRideID}`)
          .expect('Content-Type', /^application\/json/)
          .expect(200)
          .then((response) => {
            expect(response.body).to.eql(expectedResponse);
            done();
          });
      });
    });

    it('should return rides not found when not found', (done) => {
      const selectedRideID = 999;
      const expectedResponse = {
        error_code: 'RIDES_NOT_FOUND_ERROR',
        message: 'Could not find any rides',
      };
      insertMany(rideData, () => {
        request(app)
          .get(`/rides/${selectedRideID}`)
          .expect('Content-Type', /^application\/json/)
          .expect(200)
          .then((response) => {
            expect(response.body).to.eql(expectedResponse);
            done();
          });
      });
    });

    it('should return server error on any db error', (done) => {
      const selectedRideID = 2;
      const expectedResponse = {
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      };

      const dbStub = sinon.stub(db, 'all');
      dbStub.yields({ error: 'someerror' });

      request(app)
        .get(`/rides/${selectedRideID}`)
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .then((response) => {
          expect(response.body).to.eql(expectedResponse);

          dbStub.restore();
          done();
        });
    });
  });

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('GET /api-docs', () => {
    it('should return 200 for swagger documentation', (done) => {
      request(app)
        .get('/api-docs/')
        .expect('Content-Type', /^text\/html/)
        .expect(200, done);
    });
  });
});
