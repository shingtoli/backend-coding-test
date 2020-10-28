import {
  createSandbox, SinonStub,
} from 'sinon';
import { Request, Response } from 'express';
import { Database } from 'sqlite3';
import sinonChai = require('sinon-chai');
import chai = require('chai');
import { createRide } from '../../src/rides/controller';
import { Ride } from '../../src/rides/model';
import * as RideData from '../../src/rides/data';
import * as RideValidators from '../../src/rides/validator';

const { expect } = chai;
chai.use(sinonChai);

describe('Ride Controllers', () => {
  const sandbox = createSandbox();
  let db: Database;
  let res: Response;
  let mockResponse: {
    send: SinonStub
  };

  let insertRide: SinonStub;
  let findRideByID: SinonStub;

  beforeEach(() => {
    db = {} as unknown as Database;

    mockResponse = {
      send: sandbox.stub(),
    };
    res = mockResponse as unknown as Response;

    insertRide = sandbox.stub(RideData, 'insertRide');
    findRideByID = sandbox.stub(RideData, 'findRideByID');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#createRide', () => {
    let createRideHandler: (req: Request, res: Response) => Promise<void>;
    let createRideValidator: SinonStub;

    beforeEach(() => {
      createRideHandler = createRide(db);
      createRideValidator = sandbox.stub(RideValidators, 'createRideValidator');
    });

    it('should call databases', async () => {
      const req = {
        body: {},
      };

      const expected = [
        new Ride({
          rideID: 1,
          startLat: 1.2832375,
          startLong: 103.8410841,
          endLat: 1.3841121,
          endLong: 103.7364912,
          riderName: 'Adam Smith',
          driverName: 'Alexander Potemkin',
          driverVehicle: 'Lambo',
          created: '2020-10-28 08:30:14',
        }),
      ];
      createRideValidator.returns(null);
      insertRide.returns(Promise.resolve(1));
      findRideByID.returns(Promise.resolve(expected));

      await createRideHandler(req as unknown as Request, res);

      expect(mockResponse.send).to.be.calledOnceWithExactly(expected);
    });

    it('should send validation error', async () => {
      const req = {
        body: {},
      };

      const expected = {
        error_code: 'VALIDATION_ERROR',
        message: 'Any error',
      };

      createRideValidator.returns('Any error');

      await createRideHandler(req as unknown as Request, res);

      expect(mockResponse.send).to.be.calledOnceWithExactly(expected);
    });

    it('should send server error', async () => {
      const req = {
        body: {},
      };

      const expected = {
        error_code: 'SERVER_ERROR',
        message: 'Some error',
      };

      createRideValidator.returns(null);
      insertRide.rejects('Some error');

      await createRideHandler(req as unknown as Request, res);

      expect(mockResponse.send).to.be.calledOnceWithExactly(expected);
    });
  });
});
