const request = require('supertest');
const app = require('../app');
const Interaction = require('../models/InteractionModel'); 

// 1. MOCK THE ENTIRE MIDDLEWARE FILE
jest.mock('../middleware/auth/authRoute', () => ({
    requireAuth: (req, res, next) => {
        // This simulates a logged-in user
        req.userId = '64ab1234ab1234ab1234ab12';
        req.userRole = 'user';
        next();
    },
    verifyUserIdMatch: (req, res, next) => next(),
    checkRouteOwnership: (req, res, next) => next()
}));

const VALID_USER_ID = '64ab1234ab1234ab1234ab12';
const ANOTHER_USER_ID = '64cd5678cd5678cd5678cd56';
const VALID_ROUTE_ID = '64ef9012ef9012ef9012ef90';
const ANOTHER_ROUTE_ID = '640123456789abcdef012345';

describe('Interaction API', () => {

    // Clear database before tests
    beforeAll(async () => {
        try {
            await Interaction.deleteMany({});
        } catch (err) {}
    });

    describe('POST /api/interactions', () => {
        it('should create a hazard interaction successfully', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .send({
                    userId: VALID_USER_ID,
                    routeId: VALID_ROUTE_ID,
                    intLatitude: 6.9271,
                    intLongitude: 79.8612,
                    intType: 'hazard',
                    intDescription: 'Large pothole',
                    severityLevel: 'high',
                    expiryTime: '2026-03-01T00:00:00.000Z'
                });

            expect(res.status).toBe(201);
            expect(res.body.intType).toBe('hazard');
        });

        it('should fail if intType is missing', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .send({
                    userId: VALID_USER_ID,
                    severityLevel: 'low'
                });

            expect(res.status).toBe(400);
        });

        it('should fail if intType is invalid', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .send({
                    userId: VALID_USER_ID,
                    intType: 'review' 
                });

            expect(res.status).toBe(400);
        });
    });

    // describe('GET /api/interactions', () => {
    //     beforeEach(async () => {
    //         await Interaction.deleteMany({}); // Clean for precise filtering test
            
    //         await request(app).post('/api/interactions').send({
    //             userId: VALID_USER_ID,
    //             intType: 'hazard',
    //             severityLevel: 'high',
    //             routeId: VALID_ROUTE_ID
    //         });
    //         // Note: This one will be created but the controller might filter it out 
    //         // because your controller forces filter.userId = req.userId
    //         await Interaction.create({
    //             userId: ANOTHER_USER_ID,
    //             intType: 'feedback',
    //             intRating: 3,
    //             routeId: ANOTHER_ROUTE_ID,
    //             isActive: true
    //         });
    //     });

    //     it('should return all interactions (belonging to the user)', async () => {
    //         const res = await request(app).get('/api/interactions');
    //         expect(res.status).toBe(200);
    //         expect(res.body.length).toBeGreaterThanOrEqual(1);
    //     });

    //     it('should filter by userId', async () => {
    //         const res = await request(app).get(`/api/interactions?userId=${VALID_USER_ID}`);
    //         expect(res.status).toBe(200);
            
    //         // FIXED LOGIC: 
    //         // 1. We check i.userId._id because the controller .populates() the field.
    //         // 2. If population fails or is missing, we fall back to i.userId.
    //         const match = res.body.find(i => {
    //             const actualId = i.userId?._id || i.userId;
    //             return actualId?.toString() === VALID_USER_ID;
    //         });

    //         const nonMatch = res.body.find(i => {
    //             const actualId = i.userId?._id || i.userId;
    //             return actualId?.toString() === ANOTHER_USER_ID;
    //         });
            
    //         expect(match).toBeDefined();
    //         expect(nonMatch).toBeUndefined(); // This proves your controller's security filtering works
    //     });
    // });

    describe('GET /api/interactions/:id', () => {
        it('should return an interaction by id', async () => {
            const created = await request(app).post('/api/interactions').send({
                userId: VALID_USER_ID,
                intType: 'hazard',
                severityLevel: 'low'
            });

            const res = await request(app).get(`/api/interactions/${created.body._id}`);
            expect(res.status).toBe(200);
            expect(res.body._id).toBe(created.body._id);
        });
    });

    describe('PATCH /api/interactions/:id', () => {
        it('should update an interaction', async () => {
            const created = await request(app).post('/api/interactions').send({
                userId: VALID_USER_ID,
                intType: 'hazard',
                severityLevel: 'low'
            });

            const res = await request(app)
                .patch(`/api/interactions/${created.body._id}`)
                .send({ severityLevel: 'high' });

            expect(res.status).toBe(200);
            expect(res.body.severityLevel).toBe('high');
        });

        it('should reject invalid enum values on update', async () => {
            const created = await request(app).post('/api/interactions').send({
                userId: VALID_USER_ID,
                intType: 'hazard',
                severityLevel: 'low'
            });

            const res = await request(app)
                .patch(`/api/interactions/${created.body._id}`)
                .send({ severityLevel: 'extreme' });

            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/interactions/:id', () => {
        it('should delete an interaction', async () => {
            const created = await request(app).post('/api/interactions').send({
                userId: VALID_USER_ID,
                intType: 'hazard',
                severityLevel: 'low'
            });

            const res = await request(app).delete(`/api/interactions/${created.body._id}`);
            expect(res.status).toBe(200);

            const check = await request(app).get(`/api/interactions/${created.body._id}`);
            expect(check.status).toBe(404);
        });
    });
});