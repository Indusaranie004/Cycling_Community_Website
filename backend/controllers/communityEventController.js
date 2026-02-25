const CommunityEvent = require('../models/communityEvent');
const CommunityParticipant = require('../models/communityParticipant');

// GET all community events
const getAllCommunityEvents = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        
        const communityEvents = await CommunityEvent.find(filter).sort({ eventDate: 1 });
        res.status(200).json(communityEvents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET single community event by ID
const getCommunityEventById = async (req, res) => {
    try {
        const communityEvent = await CommunityEvent.findOne({ eventId: req.params.id });
        
        if (!communityEvent) {
            return res.status(404).json({ error: 'Community event not found' });
        }
        
        res.status(200).json(communityEvent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE community event
const createCommunityEvent = async (req, res) => {
    try {
        const { userId, title, description, location, eventDate, eventTime, maxParticipants } = req.body;

        if (!userId || !title || !location || !eventDate || !eventTime || !maxParticipants) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        const communityEvent = await CommunityEvent.create({
            userId, title, description, location, eventDate, eventTime, maxParticipants
        });

        res.status(201).json(communityEvent);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// JOIN community event
const joinCommunityEvent = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const communityEvent = await CommunityEvent.findOne({ eventId: req.params.id });
        
        if (!communityEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if already joined
        const existingParticipant = await CommunityParticipant.findOne({
            userId,
            eventId: communityEvent.eventId
        });

        if (existingParticipant) {
            return res.status(400).json({ error: 'Already joined this event' });
        }

        // Check if event is full
        if (communityEvent.isFull()) {
            return res.status(400).json({ error: 'Event is full' });
        }

        // Create participant record
        await CommunityParticipant.create({
            userId,
            eventId: communityEvent.eventId,
            status: 'joined',
            joinedAt: new Date()
        });

        // Update event participant count
        communityEvent.currentParticipants += 1;
        await communityEvent.save();

        res.status(200).json({ 
            message: 'Successfully joined event', 
            communityEvent 
        });
    } catch (err) {
        console.error('Join event error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET event participants
const getEventParticipants = async (req, res) => {
    try {
        const communityEvent = await CommunityEvent.findOne({ eventId: req.params.id });
        
        if (!communityEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const participants = await CommunityParticipant.find({
            eventId: communityEvent.eventId,
            status: { $ne: 'cancelled' }
        }).sort({ joinedAt: 1 });

        res.status(200).json(participants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// WITHDRAW from event
const withdrawFromEvent = async (req, res) => {
    try {
        const { userId } = req.body;

        const participant = await CommunityParticipant.findOne({
            userId,
            eventId: req.params.id
        });

        if (!participant) {
            return res.status(404).json({ error: 'Not a participant' });
        }

        participant.status = 'withdrawn';
        await participant.save();

        // Decrease event participant count
        const communityEvent = await CommunityEvent.findOne({ eventId: req.params.id });
        if (communityEvent && communityEvent.currentParticipants > 0) {
            communityEvent.currentParticipants -= 1;
            await communityEvent.save();
        }

        res.status(200).json({ message: 'Withdrawn successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE community event
const updateCommunityEvent = async (req, res) => {
    try {
        const communityEvent = await CommunityEvent.findOneAndUpdate(
            { eventId: req.params.id },
            { $set: req.body },
            { new: true, runValidators: true }
        );
        
        if (!communityEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.status(200).json(communityEvent);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// DELETE community event
const deleteCommunityEvent = async (req, res) => {
    try {
        const communityEvent = await CommunityEvent.findOneAndDelete({ eventId: req.params.id });
        
        if (!communityEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        // Delete all participant records for this event
        await CommunityParticipant.deleteMany({ eventId: communityEvent.eventId });
        
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllCommunityEvents,
    getCommunityEventById,
    createCommunityEvent,
    joinCommunityEvent,
    getEventParticipants,
    withdrawFromEvent,
    updateCommunityEvent,
    deleteCommunityEvent
};