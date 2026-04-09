const Interaction = require('../models/InteractionModel');

// get all interactions
const getAllInteractions = async (req, res) => {
    try {
        const { routeId, intType, isActive } = req.query;
        const filter = {};

        filter.userId = req.userId;          // always filter by logged-in user
        if (routeId) filter.routeId = routeId;
        if (intType) filter.intType = intType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const interactions = await Interaction.find(filter)
            .populate('userId', 'name email')   // pulls name & email from User
            .populate('routeId', 'name startLocation endLocation')  // pulls these fields from Route
            .sort({ createdAt: -1 });

        res.status(200).json(interactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// get interaction by ID
const getInteractionById = async (req, res) => {
    try {
        const interaction = await Interaction.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('routeId', 'name startLocation endLocation');

        if (!interaction) return res.status(404).json({ error: 'Interaction not found' });
        res.status(200).json(interaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// create new interaction
// const createInteraction = async (req, res) => {
//     try {
//         const {
//             routeId, intLatitude, intLongitude,
//             intType, intDescription, intRating,
//             severityLevel, intImgUrl, expiryTime, fcmToken
//         } = req.body;

//         const userId = req.userId; 
//         if (intType === 'hazard' && !severityLevel) {
//             return res.status(400).json({ error: 'severityLevel is required for hazard interactions' });
//         }
//         if (intType === 'feedback' && !intRating) {
//             return res.status(400).json({ error: 'intRating is required for feedback interactions' });
//         }

//         const interaction = await Interaction.create({
//             userId, routeId, intLatitude, intLongitude,
//             intType, intDescription, intRating,
//             severityLevel, intImgUrl, expiryTime, fcmToken
//         });

//         res.status(201).json(interaction);
//     } catch (err) {
//         if (err.name === 'ValidationError') {
//             return res.status(400).json({ error: err.message });
//         }
//         res.status(500).json({ error: err.message });
//     }
// };

const createInteraction = async (req, res) => {
    try {
        const {
            routeId, intLatitude, intLongitude,
            intType, intDescription, intRating,
            severityLevel, expiryTime, fcmToken
        } = req.body;

        const userId = req.userId; 

        // 1. Handle the Image URL from Cloudinary
        // req.file is populated by the 'upload' middleware
        let intImgUrl = req.body.intImgUrl; // Fallback to URL if provided
        if (req.file) {
            intImgUrl = req.file.path; // This is the Cloudinary secure URL
        }

        if (intType === 'hazard' && !severityLevel) {
            return res.status(400).json({ error: 'severityLevel is required for hazard interactions' });
        }
        if (intType === 'feedback' && !intRating) {
            return res.status(400).json({ error: 'intRating is required for feedback interactions' });
        }

        const interaction = await Interaction.create({
            userId, 
            routeId, 
            intLatitude: Number(intLatitude), // Ensure numbers
            intLongitude: Number(intLongitude),
            intType, 
            intDescription, 
            intRating: Number(intRating),
            severityLevel, 
            intImgUrl, // Saved the Cloudinary URL here
            expiryTime, 
            fcmToken
        });

        res.status(201).json(interaction);
    } catch (err) {
        console.error("Create error:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// update interaction (partial update)
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

//deactivate interaction (soft delete)
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

// permanently remove interaction
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