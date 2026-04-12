const { createRide, getRideById, deleteRide, getMyPersonalStats } = require('../controllers/rideController');
const Ride = require('../models/Ride');
const EcoImpact = require('../models/EcoImpact');
const CommunityStat = require('../models/CommunityStat');

// 1. Mock the Mongoose Models
jest.mock('../models/Ride');
jest.mock('../models/EcoImpact');
jest.mock('../models/CommunityStat');

describe('Ride Controller Tests', () => {
  let req, res;

  // 2. Reset everything before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Express Request and Response objects
    req = {
      userId: '60d0fe4f5311236168a109ca', // Dummy logged-in user ID
      userRole: 'user',
      body: {},
      params: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createRide', () => {
    it('should create a ride, calculate impact, and update community stats', async () => {
      req.body = {
        distance_km: 15,
        duration_minutes: 45 // Speed = 20 km/h (Valid)
      };

      // Mock database save operations
      const mockSavedRide = { _id: 'ride123', distance_km: 15 };
      Ride.prototype.save = jest.fn().mockResolvedValue(mockSavedRide);
      EcoImpact.prototype.save = jest.fn().mockResolvedValue({});
      
      const mockStats = { 
        total_community_distance: 100, 
        total_community_co2_saved: 50, 
        total_rides: 10,
        save: jest.fn().mockResolvedValue({}) 
      };
      CommunityStat.findOne.mockResolvedValue(mockStats);

      await createRide(req, res);

      // Assertions
      expect(Ride.prototype.save).toHaveBeenCalled();
      expect(EcoImpact.prototype.save).toHaveBeenCalled();
      expect(mockStats.save).toHaveBeenCalled();
      expect(mockStats.total_rides).toBe(11); // Ensure community rides went up by 1
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Ride saved' })
      );
    });

    it('should reject a ride if the calculated speed is impossibly high (> 50km/h)', async () => {
      req.body = {
        distance_km: 100,
        duration_minutes: 30 // Speed = 200 km/h (Impossible for cycling)
      };

      await createRide(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Error: Speed too high" });
      expect(Ride.prototype.save).not.toHaveBeenCalled(); // Ensure nothing was saved!
    });
  });

  describe('deleteRide', () => {
    it('should block deletion if the user does not own the ride', async () => {
      req.params.id = 'ride123';
      
      // Mock a ride owned by SOMEONE ELSE
      Ride.findById.mockResolvedValue({
        _id: 'ride123',
        user_id: { toString: () => 'DIFFERENT_USER_ID' }
      });

      await deleteRide(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Not authorized to delete this ride" });
    });

    it('should successfully delete the ride and reverse the community stats', async () => {
      req.params.id = 'ride123';
      
      const mockRide = {
        _id: 'ride123',
        user_id: { toString: () => req.userId }, // Matches logged-in user
        distance_km: 10,
        deleteOne: jest.fn().mockResolvedValue({})
      };

      const mockImpact = { co2_saved_kg: 2.1 };
      
      const mockStats = { 
        total_community_distance: 100, 
        total_community_co2_saved: 50, 
        total_rides: 10,
        save: jest.fn().mockResolvedValue({}) 
      };

      Ride.findById.mockResolvedValue(mockRide);
      EcoImpact.findOneAndDelete.mockResolvedValue(mockImpact);
      CommunityStat.findOne.mockResolvedValue(mockStats);

      await deleteRide(req, res);

      expect(mockRide.deleteOne).toHaveBeenCalled();
      expect(EcoImpact.findOneAndDelete).toHaveBeenCalledWith({ ride_id: 'ride123' });
      expect(mockStats.save).toHaveBeenCalled();
      
      // Ensure the stats were REVERSED correctly
      expect(mockStats.total_community_distance).toBe(90); // 100 - 10
      expect(mockStats.total_rides).toBe(9); // 10 - 1
      
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getMyPersonalStats', () => {
    it('should return 0s if the user has no rides', async () => {
      // Mock aggregate returning an empty array
      Ride.aggregate.mockResolvedValue([]);

      await getMyPersonalStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        total_rides: 0,
        total_distance: 0,
        total_duration: 0
      });
    });

    it('should return the aggregated stats if the user has rides', async () => {
      const mockStats = [{
        total_rides: 5,
        total_distance: 100,
        total_duration: 300
      }];
      
      Ride.aggregate.mockResolvedValue(mockStats);

      await getMyPersonalStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStats[0]);
    });
  });
});