const { getCommunityStats } = require('../controllers/communityStatController');
const CommunityStat = require('../models/CommunityStat');
const httpMocks = require('node-mocks-http');

// Mock the CommunityStat Model
jest.mock('../models/CommunityStat');

describe('Community Stat Controller', () => {
    let req, res;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        jest.clearAllMocks();
    });

    // TEST 1: Should return stats when they exist
    it('should return global community stats', async () => {
        const mockStats = {
            total_community_distance: 5000,
            total_community_co2_saved: 1200,
            total_rides: 150
        };

        // Mock FindOne to return our fake data
        CommunityStat.findOne.mockResolvedValue(mockStats);

        await getCommunityStats(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual(mockStats);
    });

    // TEST 2: Should return zeros if database is empty (First launch)
    it('should return zeros if no stats exist yet', async () => {
        // Mock FindOne to return null (Empty DB)
        CommunityStat.findOne.mockResolvedValue(null);

        await getCommunityStats(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual({
            total_community_distance: 0,
            total_community_co2_saved: 0,
            total_rides: 0
        });
    });

    // TEST 3: Handle Database Errors
    it('should return 500 if database fails', async () => {
        CommunityStat.findOne.mockRejectedValue(new Error("Database connection failed"));

        await getCommunityStats(req, res);

        expect(res.statusCode).toBe(500);
        expect(res._getJSONData().message).toBe("Database connection failed");
    });
});