const Interaction = require('../models/InteractionModel');

// GET all interactions
const getAllInteractions = async (req, res) => {
    try {
        const { userId, routeId, intType, isActive } = req.query;
        const filter = {};

        if (userId) filter.userId = userId;
        if (routeId) filter.routeId = routeId;
        if (intType) filter.intType = intType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const interactions = await Interaction.find(filter).sort({ createdAt: -1 });
        res.status(200).json(interactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET single interaction by ID
const getInteractionById = async (req, res) => {
    try {
        const interaction = await Interaction.findById(req.params.id);
        if (!interaction) return res.status(404).json({ error: 'Interaction not found' });
        res.status(200).json(interaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST create new interaction
const createInteraction = async (req, res) => {
    try {
        const {
            userId, routeId, intLatitude, intLongitude,
            intType, intDescription, intRating,
            severityLevel, intImgUrl, expiryTime
        } = req.body;

        // Validation: hazards need severity + location, feedback needs a rating
        if (intType === 'hazard' && !severityLevel) {
            return res.status(400).json({ error: 'severityLevel is required for hazard interactions' });
        }
        if (intType === 'feedback' && !intRating) {
            return res.status(400).json({ error: 'intRating is required for feedback interactions' });
        }

        const interaction = await Interaction.create({
            userId, routeId, intLatitude, intLongitude,
            intType, intDescription, intRating,
            severityLevel, intImgUrl, expiryTime
        });

        res.status(201).json(interaction);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// PATCH update interaction (partial update)
const updateInteraction = async (req, res) => {
    try {
        const interaction = await Interaction.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!interaction) return res.status(404).json({ error: 'Interaction not found' });
        res.status(200).json(interaction);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// PATCH deactivate interaction (soft delete)
const deactivateInteraction = async (req, res) => {
    try {
        const interaction = await Interaction.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive: false } },
            { new: true }
        );
        if (!interaction) return res.status(404).json({ error: 'Interaction not found' });
        res.status(200).json({ message: 'Interaction deactivated', interaction });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE permanently remove interaction
const deleteInteraction = async (req, res) => {
    try {
        const interaction = await Interaction.findByIdAndDelete(req.params.id);
        if (!interaction) return res.status(404).json({ error: 'Interaction not found' });
        res.status(200).json({ message: 'Interaction deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllInteractions,
    getInteractionById,
    createInteraction,
    updateInteraction,
    deactivateInteraction,
    deleteInteraction
};