/**
 * ============================================================================
 * COMMUNITY CHALLENGE API TESTS
 * File: tests/communityChallenge.test.js
 * ============================================================================
 * PURPOSE: Test all Community Challenge endpoints using Jest + Supertest
 * 
 * FEATURES TESTED:
 * - Challenge creation with date validation
 * - User joining challenges
 * - Progress tracking (distance accumulation)
 * - Leaderboard ranking (sorted by progress)
 * 
 * DATABASE: In-memory MongoDB via mongodb-memory-server (setup.js)
 * ============================================================================
 */

const request = require('supertest');
const app = require('../app');
const CommunityChallenge = require('../models/communityChallenge');
const CommunityParticipant = require('../models/communityParticipant');

describe('Community Challenges API', () => {

    // ========================================================================
    // TEST GROUP: GET /api/community/challenges (Retrieve all challenges)
    // ========================================================================
    describe('GET /api/community/challenges', () => {
        
        /**
         * TEST CASE: Empty Database
         * EXPECTED: Return 200 OK with empty array
         */
        it('should return empty array when no challenges exist', async () => {
            // ACT: Send GET request
            const res = await request(app).get('/api/community/challenges');

            // ASSERT: Verify response
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });
    });

    // ========================================================================
    // TEST GROUP: POST /api/community/challenges (Create new challenge)
    // ========================================================================
    describe('POST /api/community/challenges', () => {
        
        /**
         * TEST CASE 1: Valid Challenge Creation
         * EXPECTED: Return 201 Created with auto-generated challengeId
         */
        it('should create a new challenge with valid data', async () => {
            // ARRANGE: Valid challenge data
            const challengeData = {
                userId: 'user123',
                title: '100km Month',
                description: 'Cycle 100km in March',
                targetDistance: 100,      // Target: 100 kilometers
                startDate: '2026-03-01',  // Challenge start
                endDate: '2026-03-31'     // Challenge end (after start ✓)
            };

            // ACT: Send POST request
            const res = await request(app)
                .post('/api/community/challenges')
                .send(challengeData);

            // ASSERT: Verify creation
            expect(res.statusCode).toBe(201);
            expect(res.body.challengeId).toBeDefined();
            expect(res.body.challengeId).toMatch(/^CHL-/);  // Format: CHL-timestamp-random
            expect(res.body.targetDistance).toBe(100);
            expect(res.body.status).toBe('upcoming');  // Default status
        });

        /**
         * TEST CASE 2: Date Validation
         * SCENARIO: End date is before start date (invalid)
         * EXPECTED: Return 400 Bad Request with validation error
         */
        it('should fail with 400 if end date is before start date', async () => {
            // ARRANGE: Invalid date range (end before start ❌)
            const invalidData = {
                userId: 'user123',
                title: 'Invalid Challenge',
                description: 'Test',
                targetDistance: 100,
                startDate: '2026-03-31',  // 🔴 End date
                endDate: '2026-03-01'     // 🔴 Start date (WRONG ORDER)
            };

            // ACT: Send POST with invalid dates
            const res = await request(app)
                .post('/api/community/challenges')
                .send(invalidData);

            // ASSERT: Verify validation error
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('End date must be after start date');
        });
    });

    // ========================================================================
    // TEST GROUP: POST /api/community/challenges/:id/join (Join challenge)
    // ========================================================================
    describe('POST /api/community/challenges/:id/join', () => {
        
        /**
         * TEST CASE: Successful Join
         * EXPECTED: Return 200 OK, create participant record with 0 progress
         */
        it('should allow user to join a challenge', async () => {
            // ARRANGE: Create test challenge
            const challenge = await CommunityChallenge.create({
                userId: 'user123',
                title: 'Test Challenge',
                description: 'Test',
                targetDistance: 100,
                startDate: '2026-03-01',
                endDate: '2026-03-31'
            });

            // ACT: Send JOIN request
            const res = await request(app)
                .post(`/api/community/challenges/${challenge.challengeId}/join`)
                .send({ userId: 'user456' });

            // ASSERT: Verify success
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Successfully joined challenge');
        });
    });

    // ========================================================================
    // TEST GROUP: PUT /api/community/challenges/:id/progress (Update progress)
    // ========================================================================
    describe('PUT /api/community/challenges/:id/progress', () => {
        
        /**
         * TEST CASE 1: Progress Accumulation
         * SCENARIO: User logs multiple rides, distance should accumulate
         * EXPECTED: Progress = sum of all distance updates
         */
        it('should update participant progress correctly', async () => {
            // ARRANGE: Create challenge
            const challenge = await CommunityChallenge.create({
                userId: 'user123',
                title: 'Test Challenge',
                description: 'Test',
                targetDistance: 100,
                startDate: '2026-03-01',
                endDate: '2026-03-31'
            });

            // ARRANGE: User joins first (required before updating progress)
            await request(app)
                .post(`/api/community/challenges/${challenge.challengeId}/join`)
                .send({ userId: 'user456' });

            // ACT 1: User logs first ride: +25km
            const res = await request(app)
                .put(`/api/community/challenges/${challenge.challengeId}/progress`)
                .send({ userId: 'user456', distance: 25 });

            // ASSERT 1: Verify progress is 25
            expect(res.statusCode).toBe(200);
            expect(res.body.progress).toBe(25);

            // ACT 2: User logs second ride: +10km more
            const res2 = await request(app)
                .put(`/api/community/challenges/${challenge.challengeId}/progress`)
                .send({ userId: 'user456', distance: 10 });

            // ASSERT 2: Verify accumulated progress (25 + 10 = 35)
            expect(res2.body.progress).toBe(35);
        });

        /**
         * TEST CASE 2: Non-Participant Update Attempt
         * SCENARIO: User tries to update progress without joining challenge
         * EXPECTED: Return 404 Not Found
         */
        it('should fail with 404 if user is not a participant', async () => {
            // ARRANGE: Create challenge
            const challenge = await CommunityChallenge.create({
                userId: 'user123',
                title: 'Test Challenge',
                description: 'Test',
                targetDistance: 100,
                startDate: '2026-03-01',
                endDate: '2026-03-31'
            });

            // ACT: Try to update progress WITHOUT joining first
            const res = await request(app)
                .put(`/api/community/challenges/${challenge.challengeId}/progress`)
                .send({ userId: 'user999', distance: 25 });  // user999 never joined

            // ASSERT: Verify not found error
            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('Not a participant of this challenge');
        });
    });

    // ========================================================================
    // TEST GROUP: GET /api/community/challenges/:id/leaderboard (Ranking)
    // ========================================================================
    describe('GET /api/community/challenges/:id/leaderboard', () => {
        
        /**
         * TEST CASE: Leaderboard Sorting
         * SCENARIO: Multiple participants with different distances
         * EXPECTED: Return participants sorted by progress (highest first) with ranks
         */
        it('should return leaderboard sorted by progress (highest first)', async () => {
            // ARRANGE: Create challenge
            const challenge = await CommunityChallenge.create({
                userId: 'user123',
                title: 'Race Challenge',
                description: 'Test',
                targetDistance: 100,
                startDate: '2026-03-01',
                endDate: '2026-03-31'
            });

            // ARRANGE: User 1 joins and cycles 50km
            await request(app)
                .post(`/api/community/challenges/${challenge.challengeId}/join`)
                .send({ userId: 'user1' });
            await request(app)
                .put(`/api/community/challenges/${challenge.challengeId}/progress`)
                .send({ userId: 'user1', distance: 50 });

            // ARRANGE: User 2 joins and cycles 75km (🏆 Leader)
            await request(app)
                .post(`/api/community/challenges/${challenge.challengeId}/join`)
                .send({ userId: 'user2' });
            await request(app)
                .put(`/api/community/challenges/${challenge.challengeId}/progress`)
                .send({ userId: 'user2', distance: 75 });

            // ARRANGE: User 3 joins and cycles 25km
            await request(app)
                .post(`/api/community/challenges/${challenge.challengeId}/join`)
                .send({ userId: 'user3' });
            await request(app)
                .put(`/api/community/challenges/${challenge.challengeId}/progress`)
                .send({ userId: 'user3', distance: 25 });

            // ACT: Request leaderboard
            const res = await request(app)
                .get(`/api/community/challenges/${challenge.challengeId}/leaderboard`);

            // ASSERT: Verify response
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBe(3);  // All 3 participants
            
            // ASSERT: Verify ranking order (highest progress = rank 1)
            expect(res.body[0].userId).toBe('user2');  // 🥇 75km
            expect(res.body[0].progress).toBe(75);
            expect(res.body[0].rank).toBe(1);
            
            expect(res.body[1].userId).toBe('user1');  // 🥈 50km
            expect(res.body[1].progress).toBe(50);
            
            expect(res.body[2].userId).toBe('user3');  // 🥉 25km
            expect(res.body[2].progress).toBe(25);
        });
    });
});