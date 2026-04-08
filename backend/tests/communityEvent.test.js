/**
 * ============================================================================
 * COMMUNITY EVENT API TESTS
 * File: tests/communityEvent.test.js
 * ============================================================================
 * PURPOSE: Test all Community Event endpoints using Jest + Supertest
 * 
 * TEST FRAMEWORK:
 * - Jest: Test runner and assertions
 * - Supertest: Simulates HTTP requests to Express app
 * - mongodb-memory-server: In-memory DB for isolated testing (setup in setup.js)
 * 
 * TEST PATTERN: Arrange-Act-Assert (AAA)
 * - ARRANGE: Setup test data and preconditions
 * - ACT: Execute the function/endpoint being tested
 * - ASSERT: Verify the output matches expectations
 * ============================================================================
 */

// Import Supertest library to make HTTP requests to our Express app
const request = require('supertest');

// Import the Express app instance to test
const app = require('../app');

// Import Mongoose models to create test data and verify database state
const CommunityEvent = require('../models/communityEvent');
const CommunityParticipant = require('../models/communityParticipant');

// ============================================================================
// TEST SUITE: Community Events API
// ============================================================================
// describe() groups related tests together for organized output
describe('Community Events API', () => {

    // NOTE: Database cleanup is handled automatically by tests/setup.js
    // - beforeAll: Starts in-memory MongoDB
    // - afterEach: Clears all collections between tests
    // - afterAll: Stops the in-memory server
    // This ensures each test runs in isolation with a clean database

    // ========================================================================
    // TEST GROUP: GET /api/community/events (Retrieve all events)
    // ========================================================================
    describe('GET /api/community/events', () => {
        
        /**
         * TEST CASE 1: Empty Database
         * SCENARIO: No events exist in the database
         * EXPECTED: Return 200 OK with empty array
         */
        it('should return empty array when no events exist', async () => {
            // ACT: Send GET request to the events endpoint
            const res = await request(app).get('/api/community/events');

            // ASSERT: Verify HTTP status code is 200 (Success)
            expect(res.statusCode).toBe(200);
            
            // ASSERT: Verify response body is an array
            expect(Array.isArray(res.body)).toBe(true);
            
            // ASSERT: Verify array is empty (no events)
            expect(res.body.length).toBe(0);
        });

        /**
         * TEST CASE 2: Events Exist
         * SCENARIO: One or more events exist in the database
         * EXPECTED: Return 200 OK with array containing events
         */
        it('should return all events when events exist', async () => {
            // ARRANGE: Create a test event in the database
            await CommunityEvent.create({
                userId: 'user123',
                title: 'Sunday Ride',
                description: 'Morning cycling event',
                location: 'Colombo',
                eventDate: '2026-03-15',
                eventTime: '07:00',
                maxParticipants: 20
            });

            // ACT: Send GET request to fetch events
            const res = await request(app).get('/api/community/events');

            // ASSERT: Verify status is 200
            expect(res.statusCode).toBe(200);
            
            // ASSERT: Verify we received exactly 1 event
            expect(res.body.length).toBe(1);
            
            // ASSERT: Verify the event title matches what we created
            expect(res.body[0].title).toBe('Sunday Ride');
        });
    });

    // ========================================================================
    // TEST GROUP: POST /api/community/events (Create new event)
    // ========================================================================
    describe('POST /api/community/events', () => {
        
        /**
         * TEST CASE 1: Valid Event Creation
         * SCENARIO: User submits all required fields correctly
         * EXPECTED: Return 201 Created with new event object
         */
        it('should create a new event with valid data', async () => {
            // ARRANGE: Prepare valid event data matching schema requirements
            const eventData = {
                userId: 'user123',           // Required: Event creator ID
                title: 'Weekend Ride',        // Required: Event title
                description: 'Community cycling event', // Optional but provided
                location: 'Galle Face',       // Required: Event location
                eventDate: '2026-03-15',      // Required: Event date
                eventTime: '07:00',           // Required: Event time
                maxParticipants: 20           // Required: Capacity limit (min: 1)
            };

            // ACT: Send POST request with event data in request body
            const res = await request(app)
                .post('/api/community/events')  // Endpoint URL
                .send(eventData);                // JSON body

            // ASSERT: Verify HTTP 201 Created status
            expect(res.statusCode).toBe(201);
            
            // ASSERT: Verify auto-generated eventId exists
            expect(res.body.eventId).toBeDefined();
            
            // ASSERT: Verify eventId format matches pattern (EVT-timestamp-random)
            expect(res.body.eventId).toMatch(/^EVT-/);
            
            // ASSERT: Verify title was saved correctly
            expect(res.body.title).toBe('Weekend Ride');
            
            // ASSERT: Verify initial participant count is 0
            expect(res.body.currentParticipants).toBe(0);
        });

        /**
         * TEST CASE 2: Missing Required Fields
         * SCENARIO: User submits request without required fields
         * EXPECTED: Return 400 Bad Request with error message
         */
        it('should fail with 400 if required fields are missing', async () => {
            // ARRANGE: Prepare invalid data (missing title, location, date, etc.)
            const invalidData = {
                userId: 'user123'
                // ❌ Missing: title, location, eventDate, eventTime, maxParticipants
            };

            // ACT: Send POST request with incomplete data
            const res = await request(app)
                .post('/api/community/events')
                .send(invalidData);

            // ASSERT: Verify HTTP 400 Bad Request status
            expect(res.statusCode).toBe(400);
            
            // ASSERT: Verify error message is returned
            expect(res.body.error).toBeDefined();
        });
    });

    // ========================================================================
    // TEST GROUP: POST /api/community/events/:id/join (Join an event)
    // ========================================================================
    describe('POST /api/community/events/:id/join', () => {
        
        /**
         * TEST CASE 1: Successful Join
         * SCENARIO: Valid user joins an existing, non-full event
         * EXPECTED: Return 200 OK, add user to participants, increment count
         */
        it('should allow user to join an event successfully', async () => {
            // ARRANGE: Create a test event first
            const event = await CommunityEvent.create({
                userId: 'user123',
                title: 'Test Event',
                description: 'Test',
                location: 'Colombo',
                eventDate: '2026-03-15',
                eventTime: '07:00',
                maxParticipants: 20
            });

            // ACT: Send JOIN request with userId in body
            const res = await request(app)
                .post(`/api/community/events/${event.eventId}/join`)  // Dynamic URL with eventId
                .send({ userId: 'user456' });                          // User joining

            // ASSERT: Verify HTTP 200 OK status
            expect(res.statusCode).toBe(200);
            
            // ASSERT: Verify success message
            expect(res.body.message).toBe('Successfully joined event');
            
            // ASSERT: Verify participant count increased from 0 to 1
            expect(res.body.communityEvent.currentParticipants).toBe(1);
        });

        /**
         * TEST CASE 2: Duplicate Join Prevention
         * SCENARIO: User tries to join an event they already joined
         * EXPECTED: Return 400 Bad Request with "Already joined" error
         */
        it('should fail with 400 if user already joined', async () => {
            // ARRANGE: Create test event
            const event = await CommunityEvent.create({
                userId: 'user123',
                title: 'Test Event',
                description: 'Test',
                location: 'Colombo',
                eventDate: '2026-03-15',
                eventTime: '07:00',
                maxParticipants: 20
            });

            // ARRANGE: User joins the event first time (setup)
            await request(app)
                .post(`/api/community/events/${event.eventId}/join`)
                .send({ userId: 'user456' });

            // ACT: Same user tries to join again
            const res = await request(app)
                .post(`/api/community/events/${event.eventId}/join`)
                .send({ userId: 'user456' });

            // ASSERT: Verify HTTP 400 Bad Request
            expect(res.statusCode).toBe(400);
            
            // ASSERT: Verify specific error message
            expect(res.body.error).toBe('Already joined this event');
        });

        /**
         * TEST CASE 3: Event Capacity Check
         * SCENARIO: User tries to join an event that has reached max capacity
         * EXPECTED: Return 400 Bad Request with "Event is full" error
         */
        it('should fail with 400 if event is full', async () => {
            // ARRANGE: Create event with maxParticipants = 1 (only 1 spot)
            const event = await CommunityEvent.create({
                userId: 'user123',
                title: 'Small Event',
                description: 'Test',
                location: 'Colombo',
                eventDate: '2026-03-15',
                eventTime: '07:00',
                maxParticipants: 1  // 🔴 Only 1 participant allowed
            });

            // ARRANGE: First user takes the only spot
            await request(app)
                .post(`/api/community/events/${event.eventId}/join`)
                .send({ userId: 'user456' });

            // ACT: Second user tries to join (should fail)
            const res = await request(app)
                .post(`/api/community/events/${event.eventId}/join`)
                .send({ userId: 'user789' });

            // ASSERT: Verify HTTP 400 Bad Request
            expect(res.statusCode).toBe(400);
            
            // ASSERT: Verify capacity error message
            expect(res.body.error).toBe('Event is full');
        });
    });

    // ========================================================================
    // TEST GROUP: DELETE /api/community/events/:id (Delete event)
    // ========================================================================
    describe('DELETE /api/community/events/:id', () => {
        
        /**
         * TEST CASE: Cascade Delete
         * SCENARIO: Delete an event that has participants
         * EXPECTED: Event deleted AND all associated participant records removed
         */
        it('should delete event and associated participants', async () => {
            // ARRANGE: Create test event
            const event = await CommunityEvent.create({
                userId: 'user123',
                title: 'To Delete',
                description: 'Test',
                location: 'Colombo',
                eventDate: '2026-03-15',
                eventTime: '07:00',
                maxParticipants: 20
            });

            // ARRANGE: Add a participant record for this event
            await CommunityParticipant.create({
                userId: 'user456',
                eventId: event.eventId,  // Link to event
                status: 'joined'
            });

            // ACT: Send DELETE request for the event
            const res = await request(app)
                .delete(`/api/community/events/${event.eventId}`);

            // ASSERT: Verify HTTP 200 OK
            expect(res.statusCode).toBe(200);
            
            // ASSERT: Verify event no longer exists in database
            const deletedEvent = await CommunityEvent.findOne({ eventId: event.eventId });
            expect(deletedEvent).toBeNull();  // Should return null (not found)
            
            // ASSERT: Verify participant records were also deleted (cascade)
            const participants = await CommunityParticipant.find({ eventId: event.eventId });
            expect(participants.length).toBe(0);  // Should be empty array
        });
    });
});