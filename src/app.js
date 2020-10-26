'use strict';

const express = require('express');
const expressJSDocSwagger = require('express-jsdoc-swagger');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const options = {
    info: {
        version: '1.0.0',
        title: 'Rides App',
        description: 'API for creating rides. Note that application/javascript is used to force JSON rendering, it should return application/json instead.',
        license: {
            name: 'MIT',
        },
    },
    filesPattern: './**/*.js', // Glob pattern to find your jsdoc files
    baseDir: __dirname,
};

expressJSDocSwagger(app)(options);

module.exports = (db) => {
    /**
     * GET /health
     * @summary Health check endpoint
     * @return {object} 200 - OK - text/html
     * @example response - 200 - success response example
     * healthy
     */
    app.get('/health', (req, res) => res.send('Healthy'));

    /**
    * Ride Request 
    * @typedef {object} RideRequest
    * @property {number} start_lat.required - Latitude of Starting point
    * @property {number} start_long.required - Longitude of Starting point
    * @property {number} end_lat.required - Latitude of Ending point
    * @property {number} end_long.required - Longitude of Ending point
    * @property {string} rider_name.required - Name of the rider
    * @property {string} driver_name.required - Name of the driver
    * @property {string} driver_vehicle.required - Model of vehicle used
    */

    /**
     * POST /rides
     * @tags rides
     * @summary Create a ride
     * @param {RideRequest} request.body.required - New ride information
     * @example request
     * {
     *      "start_lat": 1.2832375,
     *      "start_long": 103.8410841,
     *      "end_lat": 1.3841121,
     *      "end_long": 103.7364912,
     *      "rider_name": "Adam Smith",
     *      "driver_name": "Alexander Potemkin",
     *      "driver_vehicle": "Lada Xray"
     * }
     * @return {Ride[]} 200 - OK - application/javascript
     * @example response - 200 - success example
     * [
     *   {
     *     "rideID": 1,
     *     "startLat": 1.2832375,
     *     "startLong": 103.8410841,
     *     "endLat": 1.3841121,
     *     "endLong": 103.7364912,
     *     "riderName": "Adam Smith",
     *     "driverName": "Alexander Potemkin",
     *     "driverVehicle": "Lada Xray",
     *     "created": "2020-10-26 13:46:39"
     *   }
     * ]
     */
    app.post('/rides', jsonParser, (req, res) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];

        const result = db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
                if (err) {
                    return res.send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error'
                    });
                }

                res.send(rows);
            });
        });
    });

    /**
     * GET /rides
     * @tags rides
     * @summary Retrieve all rides details
     * @return {array<Ride>} 200 - OK - application/javascript
     * @example response - 200 - success response
     * [
     *      {
     *          "rideID": 1,
     *          "startLat": 1.2832375,
     *          "startLong": 103.8410841,
     *          "endLat": 1.3841121,
     *          "endLong": 103.7364912,
     *          "riderName": "Adam Smith",
     *          "driverName": "Alexander Potemkin",
     *          "driverVehicle": "Lada Xray",
     *          "created": "2020-10-26 13:46:39"
     *      },
     *      {
     *          "rideID": 2,
     *          "startLat": 1.2498028,
     *          "startLong": 103.829944,
     *          "endLat": 1.2779591,
     *          "endLong": 103.8644958,
     *          "riderName": "Douglas MacArthur",
     *          "driverName": "Pyotr Tchaikovsky",
     *          "driverVehicle": "Marussia B2",
     *          "created": "2020-10-26 13:53:11"
     *      }
     * ]
     */
    app.get('/rides', (req, res) => {
        db.all('SELECT * FROM Rides', function (err, rows) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });

    /**
     * GET /rides/{id}
     * @tags rides
     * @param {number} id.path - Ride ID
     * @summary Retrieve a single ride by rideID
     * @return {Ride} 200 - OK - application/javascript
     * @example response - 200 - success response example
     * {
     *   "rideID": 1,
     *   "startLat": 1.2832375,
     *   "startLong": 103.8410841,
     *   "endLat": 1.3841121,
     *   "endLong": 103.7364912,
     *   "riderName": "Adam Smith",
     *   "driverName": "Alexander Potemkin",
     *   "driverVehicle": "Lada Xray",
     *   "created": "2020-10-26 13:46:39"
     * }
     */
    app.get('/rides/:id', (req, res) => {
        db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });

    return app;
};
