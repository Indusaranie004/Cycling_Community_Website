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

// CREATE community event (ADMIN only)
const createCommunityEvent = async (req, res) => {
    try {

        const userId = req.userId; // From JWT
        const userRole = req.userRole; // From JWT

        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create events' });
        }

        const { title, description, location, eventDate, eventTime, maxParticipants } = req.body;

        if (!title || !location || !eventDate || !eventTime || !maxParticipants) {
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

// JOIN community event (Authenticated users only)
const joinCommunityEvent = async (req, res) => {
    try {
        const userId = req.userId; // From JWT
        const userRole = req.userRole;
        
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (userRole === 'admin') {
            return res.status(403).json({ error: 'Admins cannot join events. Only regular users can join.' });
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

// WITHDRAW from event (Authenticated users only)
const withdrawFromEvent = async (req, res) => {
    try {
        const userId = req.userId; // From JWT

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

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

// UPDATE community event (Owner or Admin only - ownership checked in middleware)
const updateCommunityEvent = async (req, res) => {
    try {
        const existingEvent = req.event; // From middleware

        const { title, description, location, eventDate, eventTime, maxParticipants, status } = req.body;

        const updatedData = {};
        if (title !== undefined) updatedData.title = title;
        if (description !== undefined) updatedData.description = description;
        if (location !== undefined) updatedData.location = location;
        if (eventDate !== undefined) updatedData.eventDate = eventDate;
        if (eventTime !== undefined) updatedData.eventTime = eventTime;
        if (maxParticipants !== undefined) updatedData.maxParticipants = maxParticipants;
        if (status !== undefined) updatedData.status = status;

        const updatedEvent = await CommunityEvent.findOneAndUpdate(
            { eventId: existingEvent.eventId },
            { $set: updatedData },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedEvent);
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
        const event = req.event; // From middleware

        await CommunityEvent.findOneAndDelete({ eventId: event.eventId });
        await CommunityParticipant.deleteMany({ eventId: event.eventId });

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