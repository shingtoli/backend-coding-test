export class RideCreate {
  startLatitude: number;

  startLongitude: number;

  endLatitude: number;

  endLongitude: number;

  riderName: string;

  driverName: string;

  driverVehicle: string;

  constructor(body: {
    start_lat: string | number;
    start_long: string | number;
    end_lat: string | number;
    end_long: string | number;
    rider_name: string;
    driver_name: string;
    driver_vehicle: string;
  }) {
    this.startLatitude = Number(body.start_lat);
    this.startLongitude = Number(body.start_long);
    this.endLatitude = Number(body.end_lat);
    this.endLongitude = Number(body.end_long);
    this.riderName = body.rider_name;
    this.driverName = body.driver_name;
    this.driverVehicle = body.driver_vehicle;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  export(): object {
    const dbParams = {};
    Object.entries(this).forEach(([key, value]) => {
      dbParams[`$${key}`] = value;
    });
    return dbParams;
  }
}

export class Ride {
  rideID: number;

  startLat: number;

  startLong: number;

  endLat: number;

  endLong: number;

  riderName: string;

  driverName: string;

  driverVehicle: string;

  created: string;

  constructor(data: {
    rideID: number;
    startLat: number;
    startLong: number;
    endLat: number;
    endLong: number;
    riderName: string;
    driverName: string;
    driverVehicle: string;
    created: string;
  }) {
    this.rideID = data.rideID;
    this.startLat = data.startLat;
    this.startLong = data.startLong;
    this.endLat = data.endLat;
    this.endLong = data.endLong;
    this.riderName = data.riderName;
    this.driverName = data.driverName;
    this.driverVehicle = data.driverVehicle;
    this.created = data.created;
  }
}
