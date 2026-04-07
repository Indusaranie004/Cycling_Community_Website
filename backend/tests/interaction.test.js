const request = require('supertest');
const app = require('../app');

describe('Interaction API', () => {

    // ─── POST ────────────────────────────────────────────────────────────────

    describe('POST /api/interactions', () => {

        it('should create a hazard interaction successfully', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .send({
                    userId: 'user123',
                    routeId: 'route456',
                    intLatitude: 6.9271,
                    intLongitude: 79.8612,
                    intType: 'hazard',
                    intDescription: 'Large pothole',
                    severityLevel: 'high',
                    expiryTime: '2026-03-01T00:00:00.000Z'
                });

            expect(res.status).toBe(201);
            expect(res.body.intType).toBe('hazard');
            expect(res.body.severityLevel).toBe('high');
            expect(res.body.isActive).toBe(true);
            expect(res.body.interactionId).toBeDefined();
        });

        it('should create a feedback interaction successfully', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .send({
                    userId: 'user123',
                    routeId: 'route456',
                    intType: 'feedback',
                    intDescription: 'Smooth route!',
                    intRating: 4
                });

            expect(res.status).toBe(201);
            expect(res.body.intType).toBe('feedback');
            expect(res.body.intRating).toBe(4);
        });

        it('should fail if userId is missing', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .send({
                    intType: 'hazard',
                    severityLevel: 'low'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should fail if intType is invalid', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .send({
                    userId: 'user123',
                    intType: 'review' // not in enum
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        it('should fail if hazard is missing severityLevel', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .send({
                    userId: 'user123',
                    intType: 'hazard',
                    intDescription: 'Missing severity'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/severityLevel/);
        });

        it('should fail if feedback is missing intRating', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .send({
                    userId: 'user123',
                    intType: 'feedback',
                    intDescription: 'No rating given'
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/intRating/);
        });

        it('should fail if intRating is out of range', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .send({
                    userId: 'user123',
                    intType: 'feedback',
                    intRating: 10 // max is 5
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });
    });

    // ─── GET ALL ─────────────────────────────────────────────────────────────

    describe('GET /api/interactions', () => {

        beforeEach(async () => {
            await request(app).post('/api/interactions').send({
                userId: 'user123',
                intType: 'hazard',
                severityLevel: 'high',
                routeId: 'route1'
            });
            await request(app).post('/api/interactions').send({
                userId: 'user456',
                intType: 'feedback',
                intRating: 3,
                routeId: 'route2'
            });
        });

        it('should return all interactions', async () => {
            const res = await request(app).get('/api/interactions');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
        });

        it('should filter by userId', async () => {
            const res = await request(app).get('/api/interactions?userId=user123');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].userId).toBe('user123');
        });

        it('should filter by intType', async () => {
            const res = await request(app).get('/api/interactions?intType=feedback');
            expect(res.status).toBe(200);
            expect(res.body.every(i => i.intType === 'feedback')).toBe(true);
        });

        it('should filter by routeId', async () => {
            const res = await request(app).get('/api/interactions?routeId=route1');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].routeId).toBe('route1');
        });

        it('should filter by isActive', async () => {
            const res = await request(app).get('/api/interactions?isActive=true');
            expect(res.status).toBe(200);
            expect(res.body.every(i => i.isActive === true)).toBe(true);
        });
    });

    // ─── GET BY ID ───────────────────────────────────────────────────────────

    describe('GET /api/interactions/:id', () => {

        it('should return an interaction by id', async () => {
            const created = await request(app).post('/api/interactions').send({
                userId: 'user123',
                intType: 'hazard',
                severityLevel: 'low'
            });

            const res = await request(app).get(`/api/interactions/${created.body._id}`);
            expect(res.status).toBe(200);
            expect(res.body._id).toBe(created.body._id);
        });

        it('should return 404 for non-existent id', async () => {
            const res = await request(app).get('/api/interactions/64ab1234ab1234ab1234ab12');
            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Interaction not found');
        });
    });

    // ─── PATCH UPDATE ────────────────────────────────────────────────────────

    describe('PATCH /api/interactions/:id', () => {

        it('should update an interaction', async () => {
            const created = await request(app).post('/api/interactions').send({
                userId: 'user123',
                intType: 'hazard',
                severityLevel: 'low'
            });

            const res = await request(app)
                .patch(`/api/interactions/${created.body._id}`)
                .send({ severityLevel: 'high' });

            expect(res.status).toBe(200);
            expect(res.body.severityLevel).toBe('high');
        });

        it('should return 404 for non-existent id', async () => {
            const res = await request(app)
                .patch('/api/interactions/64ab1234ab1234ab1234ab12')
                .send({ severityLevel: 'medium' });

            expect(res.status).toBe(404);
        });

        it('should reject invalid enum values on update', async () => {
            const created = await request(app).post('/api/interactions').send({
                userId: 'user123',
                intType: 'hazard',
                severityLevel: 'low'
            });

            const res = await request(app)
                .patch(`/api/interactions/${created.body._id}`)
                .send({ severityLevel: 'extreme' }); // not in enum

            expect(res.status).toBe(400);
        });
    });

    // ─── PATCH DEACTIVATE ────────────────────────────────────────────────────

    describe('PATCH /api/interactions/:id/deactivate', () => {

        it('should deactivate an interaction', async () => {
            const created = await request(app).post('/api/interactions').send({
                userId: 'user123',
                intType: 'hazard',
                severityLevel: 'medium'
            });

            const res = await request(app)
                .patch(`/api/interactions/${created.body._id}/deactivate`);

            expect(res.status).toBe(200);
            expect(res.body.interaction.isActive).toBe(false);
        });

        it('should return 404 for non-existent id', async () => {
            const res = await request(app)
                .patch('/api/interactions/64ab1234ab1234ab1234ab12/deactivate');

            expect(res.status).toBe(404);
        });
    });

    // ─── DELETE ──────────────────────────────────────────────────────────────

    describe('DELETE /api/interactions/:id', () => {

        it('should delete an interaction', async () => {
            const created = await request(app).post('/api/interactions').send({
                userId: 'user123',
                intType: 'hazard',
                severityLevel: 'low'
            });

            const res = await request(app).delete(`/api/interactions/${created.body._id}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Interaction deleted successfully');

            // confirm it's gone
            const check = await request(app).get(`/api/interactions/${created.body._id}`);
            expect(check.status).toBe(404);
        });

        it('should return 404 for non-existent id', async () => {
            const res = await request(app).delete('/api/interactions/64ab1234ab1234ab1234ab12');
            expect(res.status).toBe(404);
        });
    });
});