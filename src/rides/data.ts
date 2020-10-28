import { Database } from 'sqlite3';
import { Ride, RideCreate } from './model';

export const insertRide = (
  db: Database,
  rideCreate: RideCreate,
): Promise<number> => new Promise((resolve, reject) => {
  db.run(
    `INSERT INTO
     Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle)
     VALUES ($startLatitude, $startLongitude, $endLatitude, $endLongitude, $riderName, $driverName, $driverVehicle)`,
    rideCreate.export(), function callback(err) {
      if (err) {
        reject('Unknown error');
        return;
      }

      resolve(this.lastID);
    },
  );
});

export const listRides = (
  db: Database,
  limit: number,
  offset: number,
): Promise<Ride[]> => new Promise((resolve, reject) => {
  let sqlQuery = 'SELECT * FROM Rides';
  let dbParams = {};

  if (limit > 0) {
    sqlQuery = `${sqlQuery} LIMIT $limit`;
    dbParams = { ...dbParams, $limit: limit };
  }

  if (offset > 0) {
    if (!limit) {
      reject({
        error_code: 'QUERY_ERROR',
        message: 'Offset must be provided with limit',
      });
      return;
    }
    sqlQuery = `${sqlQuery} OFFSET $offset`;
    dbParams = { ...dbParams, $offset: offset };
  }

  db.all(sqlQuery, dbParams, (err, rows) => {
    if (err) {
      reject({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      });
      return;
    }

    if (rows.length === 0) {
      reject({
        error_code: 'RIDES_NOT_FOUND_ERROR',
        message: 'Could not find any rides',
      });
      return;
    }

    const output = rows.map((item) => new Ride(item));
    resolve(output);
  });
});

export const findRideByID = (
  db: Database,
  rideId: number,
): Promise<Ride[]> => new Promise((resolve, reject) => {
  db.all('SELECT * FROM Rides WHERE rideID = $rideID',
    { $rideID: rideId },
    (err, rows) => {
      if (err) {
        reject('Unknown error');
        return;
      }

      const output = rows.map((item) => new Ride(item));
      resolve(output);
    });
});
