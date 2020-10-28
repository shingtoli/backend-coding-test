import { Request, Response } from 'express';
import { Database } from 'sqlite3';
import { RideCreate } from './model';
import { createRideValidator } from './validator';
import { insertRide, findRideByID, listRides } from './data';

export const createRide = (db: Database) => async (req: Request, res: Response): Promise<void> => {
  const ride = new RideCreate(req.body);

  const validation = createRideValidator(ride);
  if (validation) {
    res.send({
      error_code: 'VALIDATION_ERROR',
      message: validation,
    });
    return;
  }

  try {
    const rideID = await insertRide(db, ride);
    const inserted = await findRideByID(db, rideID);
    res.send(inserted);
  } catch (e) {
    res.send({
      error_code: 'SERVER_ERROR',
      message: e.toString(),
    });
  }
};

export const fetchRides = (db: Database) => async (req: Request, res: Response): Promise<void> => {
  const limit = Number.parseInt(req.query.limit as string, 10);
  const offset = Number.parseInt(req.query.offset as string, 10);

  try {
    const rides = await listRides(db, limit, offset);
    res.send(rides);
  } catch (e) {
    res.send(e);
  }
};

export const getRideById = (db: Database) => async (req: Request, res: Response): Promise<void> => {
  const seekId = Number(req.params.id);
  try {
    const rows = await findRideByID(db, seekId);
    if (rows.length === 0) {
      res.send({
        error_code: 'RIDES_NOT_FOUND_ERROR',
        message: 'Could not find any rides',
      });
      return;
    }

    res.send(rows);
  } catch (e) {
    res.send({
      error_code: 'SERVER_ERROR',
      message: e.toString(),
    });
  }
};
