const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Mock the email service so tests never need a real RESEND_API_KEY.
jest.mock('../utils/emailService', () => ({
    sendMonthlyReport: jest.fn().mockResolvedValue({ success: true })
}));

// Give CI enough time to spin up the in-memory MongoDB instance
jest.setTimeout(30000);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});