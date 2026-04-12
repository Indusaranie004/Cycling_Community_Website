const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const testUserId = new mongoose.Types.ObjectId().toString();
const testToken = jwt.sign(
    { userId: testUserId, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
);
const testRouteId = new mongoose.Types.ObjectId().toString();

describe('Interaction API', () => {

    // ─── POST ────────────────────────────────────────────────────────────────

    describe('POST /api/interactions', () => {

        it('should create a hazard interaction successfully', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    routeId: testRouteId,
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
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                    routeId: testRouteId,
                    intType: 'feedback',
                    intDescription: 'Smooth route!',
                    intRating: 4
                });

            expect(res.status).toBe(201);
            expect(res.body.intType).toBe('feedback');
            expect(res.body.intRating).toBe(4);
        });

        it('should fail if intType is invalid', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ intType: 'review' });

            expect(res.status).toBe(400);
            const hasError = res.body.error !== undefined || res.body.errors !== undefined;
            expect(hasError).toBe(true);
        });

        it('should fail if hazard is missing severityLevel', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ intType: 'hazard', intDescription: 'Missing severity' });

            expect(res.status).toBe(400);
            const message = res.body.error || JSON.stringify(res.body.errors);
            expect(message).toMatch(/severityLevel/);
        });

        it('should fail if feedback is missing intRating', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ intType: 'feedback', intDescription: 'No rating given' });

            expect(res.status).toBe(400);
            const message = res.body.error || JSON.stringify(res.body.errors);
            expect(message).toMatch(/intRating/);
        });

        it('should fail if intRating is out of range', async () => {
            const res = await request(app)
                .post('/api/interactions')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ intType: 'feedback', intRating: 10 });

            expect(res.status).toBe(400);
            const hasError = res.body.error !== undefined || res.body.errors !== undefined;
            expect(hasError).toBe(true);
        });
    });

    // ─── GET ALL ─────────────────────────────────────────────────────────────

    describe('GET /api/interactions', () => {

        let routeId1;
        let routeId2;

        beforeEach(async () => {
            routeId1 = new mongoose.Types.ObjectId().toString();
            routeId2 = new mongoose.Types.ObjectId().toString();

            // Create two interactions both owned by the same testToken user,
            // since the GET endpoint appears to scope results to the current user.
            await request(app)
                .post('/api/interactions')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ intType: 'hazard', severityLevel: 'high', routeId: routeId1 });

            await request(app)
                .post('/api/interactions')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ intType: 'feedback', intRating: 3, routeId: routeId2 });
        });

        it('should return all interactions for the current user', async () => {
            const res = await request(app)
                .get('/api/interactions')
                .set('Authorization', `Bearer ${testToken}`);
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
        });

        it('should filter by intType', async () => {
            const res = await request(app)
                .get('/api/interactions?intType=feedback')
                .set('Authorization', `Bearer ${testToken}`);
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            expect(res.body.every(i => i.intType === 'feedback')).toBe(true);
        });

        it('should filter by routeId', async () => {
            const res = await request(app)
                .get(`/api/interactions?routeId=${routeId1}`)
                .set('Authorization', `Bearer ${testToken}`);
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            // routeId may or may not appear in response body depending on serialisation
            expect(res.body[0].intType).toBe('hazard');
        });

        it('should filter by isActive', async () => {
            const res = await request(app)
                .get('/api/interactions?isActive=true')
                .set('Authorization', `Bearer ${testToken}`);
            expect(res.status).toBe(200);
            expect(res.body.every(i => i.isActive === true)).toBe(true);
        });
    });

    // ─── GET BY ID ───────────────────────────────────────────────────────────

    describe('GET /api/interactions/:id', () => {

        it('should return an interaction by id', async () => {
            const created = await request(app)
                .post('/api/interactions')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ intType: 'hazard', severityLevel: 'low' });

            expect(created.status).toBe(201);

            const res = await request(app)
                .get(`/api/interactions/${created.body._id}`)
                .set('Authorization', `Bearer ${testToken}`);
            expect(res.status).toBe(200);
            expect(res.body._id).toBe(created.body._id);
        });

        it('should return 404 for non-existent id', async () => {
            const res = await request(app)
                .get('/api/interactions/64ab1234ab1234ab1234ab12')
                .set('Authorization', `Bearer ${testToken}`);
            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Interaction not found');
        });
    });

    // ─── PATCH UPDATE ────────────────────────────────────────────────────────

    describe('PATCH /api/interactions/:id', () => {

        it('should update an interaction', async () => {
            const created = await request(app)
                .post('/api/interactions')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ intType: 'hazard', severityLevel: 'low' });

            expect(created.status).toBe(201);

            const res = await request(app)
                .patch(`/api/interactions/${created.body._id}`)
                .set('Authorization', `Bearer ${testToken}`)
                .send({ severityLevel: 'high' });

            expect(res.status).toBe(200);
            expect(res.body.severityLevel).toBe('high');
        });

        it('should return 404 for non-existent id', async () => {
            const res = await request(app)
                .patch('/api/interactions/64ab1234ab1234ab1234ab12')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ severityLevel: 'medium' });

            expect(res.status).toBe(404);
        });

        it('should reject invalid enum values on update', async () => {
            const created = await request(app)
                .post('/api/interactions')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ intType: 'hazard', severityLevel: 'low' });

            expect(created.status).toBe(201);

            const res = await request(app)
                .patch(`/api/interactions/${created.body._id}`)
                .set('Authorization', `Bearer ${testToken}`)
                .send({ severityLevel: 'extreme' });

            expect(res.status).toBe(400);
        });
    });

    // ─── PATCH DEACTIVATE ────────────────────────────────────────────────────

    describe('PATCH /api/interactions/:id/deactivate', () => {

        it('should deactivate an interaction', async () => {
            const created = await request(app)
                .post('/api/interactions')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ intType: 'hazard', severityLevel: 'medium' });

            expect(created.status).toBe(201);

            const res = await request(app)
                .patch(`/api/interactions/${created.body._id}/deactivate`)
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.status).toBe(200);
            expect(res.body.interaction.isActive).toBe(false);
        });

        it('should return 404 for non-existent id', async () => {
            const res = await request(app)
                .patch('/api/interactions/64ab1234ab1234ab1234ab12/deactivate')
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.status).toBe(404);
        });
    });

    // ─── DELETE ──────────────────────────────────────────────────────────────

    describe('DELETE /api/interactions/:id', () => {

        it('should delete an interaction', async () => {
            const created = await request(app)
                .post('/api/interactions')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ intType: 'hazard', severityLevel: 'low' });

            expect(created.status).toBe(201);

            const res = await request(app)
                .delete(`/api/interactions/${created.body._id}`)
                .set('Authorization', `Bearer ${testToken}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Interaction deleted successfully');

            const check = await request(app)
                .get(`/api/interactions/${created.body._id}`)
                .set('Authorization', `Bearer ${testToken}`);
            expect(check.status).toBe(404);
        });

        it('should return 404 for non-existent id', async () => {
            const res = await request(app)
                .delete('/api/interactions/64ab1234ab1234ab1234ab12')
                .set('Authorization', `Bearer ${testToken}`);
            expect(res.status).toBe(404);
        });
    });
});