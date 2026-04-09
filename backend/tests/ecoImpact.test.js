const { getImpactByRideId, getUserImpactStats } = require('../controllers/ecoImpactController');
const EcoImpact = require('../models/EcoImpact');
const Ride = require('../models/Ride');
const httpMocks = require('node-mocks-http');

// Mock both models
jest.mock('../models/EcoImpact');
jest.mock('../models/Ride');

describe('Eco Impact Controller', () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        jest.clearAllMocks();
    });

    // ==========================================
    // PART A: Get Impact by Ride ID
    // ==========================================

    it('should return impact data for a valid ride ID', async () => {
        req.params.rideId = "valid_ride_id";
        const mockImpact = { co2_saved_kg: 5.5, eco_score: 50 };

        EcoImpact.findOne.mockResolvedValue(mockImpact);

        await getImpactByRideId(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(mockImpact);
    });

    it('should return 404 if impact report is not found', async () => {
        req.params.rideId = "missing_id";
        EcoImpact.findOne.mockResolvedValue(null);

        await getImpactByRideId(req, res);

        expect(res.statusCode).toBe(404);
        expect(res._getJSONData().message).toBe("Impact report not found");
    });

    // ==========================================
    // PART B: Get Cumulative User Stats
    // ==========================================

    it('should calculate total user stats (Aggregation)', async () => {
        req.params.userId = "user_123";

        // Step 1: Mock finding user rides
        Ride.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([{ _id: "ride1" }, { _id: "ride2" }])
        });

        // Step 2: Mock the MongoDB Aggregation (Summing up totals)
        const mockAggregation = [{
            totalCo2: 10,
            totalFuel: 5,
            totalCalories: 500,
            totalScore: 100
        }];
        EcoImpact.aggregate.mockResolvedValue(mockAggregation);

        await getUserImpactStats(req, res);

        expect(res.statusCode).toBe(200);
        // It should return the first item of the array (the totals)
        expect(res._getJSONData()).toEqual(mockAggregation[0]);
    });

    it('should return zeros if user has no rides', async () => {
        req.params.userId = "new_user";

        // Step 1: User has 0 rides
        Ride.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([]) 
        });

        // Step 2: Aggregation result for empty list is empty array
        EcoImpact.aggregate.mockResolvedValue([]);

        await getUserImpactStats(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual({
            totalCo2: 0,
            totalFuel: 0,
            totalCalories: 0,
            totalScore: 0
        });
    });
});