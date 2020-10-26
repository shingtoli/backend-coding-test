'use strict';

module.exports = (db) => {
    /**
     * Rides
     * @typedef {object} Ride
     * @property {number} rideID - Ride Identifier
     * @property {number} startLat - Latitude of Starting point
     * @property {number} startLong - Longitude of Starting point
     * @property {number} endLat - Latitude of Ending point
     * @property {number} endLong - Longitude of Ending point
     * @property {string} riderName - Name of the rider
     * @property {string} driverName - Name of the driver
     * @property {string} driverVehicle - Model of vehicle used
     * @property {string} created - time when ride was created 
     */
  
    const createRideTableSchema = `
        CREATE TABLE Rides
        (
        rideID INTEGER PRIMARY KEY AUTOINCREMENT,
        startLat DECIMAL NOT NULL,
        startLong DECIMAL NOT NULL,
        endLat DECIMAL NOT NULL,
        endLong DECIMAL NOT NULL,
        riderName TEXT NOT NULL,
        driverName TEXT NOT NULL,
        driverVehicle TEXT NOT NULL,
        created DATETIME default CURRENT_TIMESTAMP
        )
    `;

    db.run(createRideTableSchema);

    return db;
};
