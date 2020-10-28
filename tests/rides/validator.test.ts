import { expect } from 'chai';
import { RideCreate } from '../../src/rides/model';
import { createRideValidator } from '../../src/rides/validator';

describe('Ride Validators', () => {
  describe('#createRideValidator', () => {
    it('should validate valid data', () => {
      const ride = new RideCreate({
        start_lat: 1.2832375,
        start_long: 103.8410841,
        end_lat: 1.3841121,
        end_long: 103.7364912,
        rider_name: 'Adam Smith',
        driver_name: 'Alexander Potemkin',
        driver_vehicle: 'Lada Xray',
      });
      expect(createRideValidator(ride)).to.eql(null);
    });

    it('should invalidate start lat lower bound', () => {
      const ride = new RideCreate({
        start_lat: -91,
        start_long: 103.8410841,
        end_lat: 1.3841121,
        end_long: 103.7364912,
        rider_name: 'Adam Smith',
        driver_name: 'Alexander Potemkin',
        driver_vehicle: 'Lada Xray',
      });
      expect(createRideValidator(ride)).to.have.string('Start latitude and longitude');
    });

    it('should invalidate start lat upper bound', () => {
      const ride = new RideCreate({
        start_lat: 91,
        start_long: 103.8410841,
        end_lat: 1.3841121,
        end_long: 103.7364912,
        rider_name: 'Adam Smith',
        driver_name: 'Alexander Potemkin',
        driver_vehicle: 'Lada Xray',
      });
      expect(createRideValidator(ride)).to.have.string('Start latitude and longitude');
    });

    it('should invalidate start long lower bound', () => {
      const ride = new RideCreate({
        start_lat: 90,
        start_long: -181,
        end_lat: 1.3841121,
        end_long: 103.7364912,
        rider_name: 'Adam Smith',
        driver_name: 'Alexander Potemkin',
        driver_vehicle: 'Lada Xray',
      });
      expect(createRideValidator(ride)).to.have.string('Start latitude and longitude');
    });

    it('should invalidate start long upper bound', () => {
      const ride = new RideCreate({
        start_lat: 90,
        start_long: 181,
        end_lat: 1.3841121,
        end_long: 103.7364912,
        rider_name: 'Adam Smith',
        driver_name: 'Alexander Potemkin',
        driver_vehicle: 'Lada Xray',
      });
      expect(createRideValidator(ride)).to.have.string('Start latitude and longitude');
    });

    it('should invalidate end lat lower bound', () => {
      const ride = new RideCreate({
        start_lat: -90,
        start_long: 103.8410841,
        end_lat: -91,
        end_long: 103.7364912,
        rider_name: 'Adam Smith',
        driver_name: 'Alexander Potemkin',
        driver_vehicle: 'Lada Xray',
      });
      expect(createRideValidator(ride)).to.have.string('End latitude and longitude');
    });

    it('should invalidate end lat upper bound', () => {
      const ride = new RideCreate({
        start_lat: 90,
        start_long: 103.8410841,
        end_lat: 91,
        end_long: 103.7364912,
        rider_name: 'Adam Smith',
        driver_name: 'Alexander Potemkin',
        driver_vehicle: 'Lada Xray',
      });
      expect(createRideValidator(ride)).to.have.string('End latitude and longitude');
    });

    it('should invalidate end long lower bound', () => {
      const ride = new RideCreate({
        start_lat: 90,
        start_long: -180,
        end_lat: 1.3841121,
        end_long: -181,
        rider_name: 'Adam Smith',
        driver_name: 'Alexander Potemkin',
        driver_vehicle: 'Lada Xray',
      });
      expect(createRideValidator(ride)).to.have.string('End latitude and longitude');
    });

    it('should invalidate end long upper bound', () => {
      const ride = new RideCreate({
        start_lat: 90,
        start_long: 180,
        end_lat: 1.3841121,
        end_long: 181,
        rider_name: 'Adam Smith',
        driver_name: 'Alexander Potemkin',
        driver_vehicle: 'Lada Xray',
      });
      expect(createRideValidator(ride)).to.have.string('End latitude and longitude');
    });

    it('should invalidate empty rider name', () => {
      const ride = new RideCreate({
        start_lat: 1.2832375,
        start_long: 103.8410841,
        end_lat: 1.3841121,
        end_long: 103.7364912,
        rider_name: '',
        driver_name: 'Alexander Potemkin',
        driver_vehicle: 'Lada Xray',
      });
      expect(createRideValidator(ride)).to.have.string('Rider name');
    });

    it('should invalidate empty driver name', () => {
      const ride = new RideCreate({
        start_lat: 1.2832375,
        start_long: 103.8410841,
        end_lat: 1.3841121,
        end_long: 103.7364912,
        rider_name: 'Adam Smith',
        driver_name: '',
        driver_vehicle: 'Lada Xray',
      });
      expect(createRideValidator(ride)).to.have.string('Driver name');
    });

    it('should invalidate empty driver vehicle', () => {
      const ride = new RideCreate({
        start_lat: 1.2832375,
        start_long: 103.8410841,
        end_lat: 1.3841121,
        end_long: 103.7364912,
        rider_name: 'Adam Smith',
        driver_name: 'Alexander Potemkin',
        driver_vehicle: '',
      });
      expect(createRideValidator(ride)).to.have.string('Driver vehicle');
    });
  });
});
