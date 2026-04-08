const { createRide, getUserRides } = require('../controllers/rideController');
const Ride = require('../models/Ride');
const EcoImpact = require('../models/EcoImpact');
const CommunityStat = require('../models/CommunityStat');
const httpMocks = require('node-mocks-http');

// --- MOCK THE DATABASE MODELS ---
// We don't want to write to the real DB during tests
jest.mock('../models/Ride');
jest.mock('../models/EcoImpact');
jest.mock('../models/CommunityStat');

describe('Ride Controller', () => {
    
    let req, res;

    // Reset mocks before each test
    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        jest.clearAllMocks();
    });

    // ============================================
    // TEST 1: Validation Failures
    // ============================================

    it('should return 400 if distance is 0 or negative', async () => {
        req.body = { distance_km: 0, duration_minutes: 10, avg_speed: 15 };
        
        await createRide(req, res);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData().message).toBe("Error: Distance must be greater than 0");
    });

    it('should return 400 if speed is suspiciously high (> 50km/h)', async () => {
        req.body = { distance_km: 10, duration_minutes: 5, avg_speed: 60 }; // 60 km/h
        
        await createRide(req, res);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData().message).toBe("Error: GPS data invalid (Speed too high for cycling)");
    });

    it('should return 400 if duration is impossible (Teleportation check)', async () => {
        // 10km in 1 minute = 600km/h
        req.body = { distance_km: 10, duration_minutes: 1, avg_speed: 20 };
        
        await createRide(req, res);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData().message).toBe("Error: Duration is not reasonable for this distance");
    });

    // ============================================
    // TEST 2: Successful Ride Creation
    // ============================================

    it('should successfully create a ride, eco impact, and update stats', async () => {
        // 1. Setup Request Data
        req.body = {
            user_id: "dummy_user_id",
            distance_km: 10,
            duration_minutes: 30,
            avg_speed: 20,
            start_time: "10:00",
            end_time: "10:30"
        };

        // 2. Setup Database Mocks
        // Mock Ride.save()
        const mockRideSave = jest.fn().mockReturnValue({ _id: "new_ride_id", distance_km: 10 });
        Ride.mockImplementation(() => ({ save: mockRideSave }));

        // Mock EcoImpact.save()
        const mockImpactSave = jest.fn().mockReturnValue({ co2_saved_kg: 2.1 });
        EcoImpact.mockImplementation(() => ({ save: mockImpactSave }));

        // Mock CommunityStat.findOne() and save()
        const mockStatSave = jest.fn();
        CommunityStat.findOne.mockResolvedValue({ 
            total_community_distance: 100,
            total_community_co2_saved: 50,
            total_rides: 10,
            save: mockStatSave 
        });

        // 3. Run the Controller
        await createRide(req, res);

        // 4. Assertions (Check if code worked)
        expect(res.statusCode).toBe(201);
        
        // Check if Ride was saved
        expect(mockRideSave).toHaveBeenCalled();
        
        // Check if Eco Impact was calculated correctly
        // 10km * 0.21 = 2.1 kg CO2
        expect(EcoImpact).toHaveBeenCalledWith(expect.objectContaining({
            co2_saved_kg: "2.10",
            ride_id: "new_ride_id"
        }));

        // Check if Community Stats were updated
        expect(mockStatSave).toHaveBeenCalled();
        // Previous 100 + New 10 = 110
        expect(res._getJSONData().message).toBe("Ride saved and Impact calculated");
    });

    // ============================================
    // TEST 3: Community Stats (First Time)
    // ============================================

    it('should create new community stats if none exist', async () => {
        req.body = {
            user_id: "dummy", distance_km: 10, duration_minutes: 30, avg_speed: 20, start_time: "10:00", end_time: "10:30"
        };

        // Mocks
        Ride.mockImplementation(() => ({ save: jest.fn().mockReturnValue({ _id: "id" }) }));
        EcoImpact.mockImplementation(() => ({ save: jest.fn() }));

        // Mock findOne returning null (First ever ride)
        CommunityStat.findOne.mockResolvedValue(null);
        
        // Mock the constructor for new Stats
        const mockStatSave = jest.fn();
        CommunityStat.mockImplementation(() => ({
            total_community_distance: 0,
            total_community_co2_saved: 0,
            total_rides: 0,
            save: mockStatSave
        }));

        await createRide(req, res);

        expect(CommunityStat).toHaveBeenCalled(); // Should call new CommunityStat()
        expect(mockStatSave).toHaveBeenCalled();
    });
});