const Interaction = require('../models/InteractionModel');

// get all interactions
const getAllInteractions = async (req, res) => {
    try {
        const { routeId, intType, isActive } = req.query;
        const filter = {};

        // filter by logged-in user
        filter.userId = req.userId;          
        if (routeId) filter.routeId = routeId;
        if (intType) filter.intType = intType;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const interactions = await Interaction.find(filter)
            .populate('userId', 'name email')
            .populate('routeId', 'name startLocation endLocation')
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
const createInteraction = async (req, res) => {
    try {
        const {
            routeId, intLatitude, intLongitude,
            intType, intDescription, intRating,
            severityLevel, expiryTime, fcmToken
        } = req.body;

        const userId = req.userId; 

        // 1. Handle Image from Cloudinary (Multer)
        let intImgUrl = "";
        if (req.file) {
            intImgUrl = req.file.path; 
        }

        // 2. Data Cleaning (Prevent 400 errors from empty strings in Numbers/ObjectIDs)
        const interactionData = {
            userId,
            intType,
            intDescription,
            severityLevel,
            intImgUrl,
            expiryTime,
            fcmToken,
            isActive: true
        };

        // Convert string numbers to real numbers
        if (intRating) interactionData.intRating = Number(intRating);
        if (intLatitude && intLatitude !== "") interactionData.intLatitude = Number(intLatitude);
        if (intLongitude && intLongitude !== "") interactionData.intLongitude = Number(intLongitude);

        // Only add routeId if it's a valid string (not empty)
        if (routeId && routeId !== "" && routeId !== "null" && routeId !== "undefined") {
            interactionData.routeId = routeId;
        }

        // 3. Manual Validation Logic
        if (intType === 'hazard' && !severityLevel) {
            return res.status(400).json({ error: 'severityLevel is required for hazard' });
        }
        if (intType === 'feedback' && !intRating) {
            return res.status(400).json({ error: 'intRating is required for feedback' });
        }

        const interaction = await Interaction.create(interactionData);
        res.status(201).json(interaction);

    } catch (err) {
        console.error("BACKEND POST ERROR:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// update interaction (partial update)
const updateInteraction = async (req, res) => {
    try {
        let updateData = { ...req.body };

        // Handle image if a new one is uploaded
        if (req.file) {
            updateData.intImgUrl = req.file.path;
        }

        // Clean number fields to prevent CastErrors
        if (updateData.intRating) updateData.intRating = Number(updateData.intRating);
        if (updateData.intLatitude) updateData.intLatitude = Number(updateData.intLatitude);
        if (updateData.intLongitude) updateData.intLongitude = Number(updateData.intLongitude);

        // Remove routeId if it's an empty string or invalid
        if (updateData.routeId === "" || updateData.routeId === "null") {
            delete updateData.routeId;
        }

        const interaction = await Interaction.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!interaction) return res.status(404).json({ error: 'Interaction not found' });
        res.status(200).json(interaction);

    } catch (err) {
        console.error("BACKEND PATCH ERROR:", err);
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

// get all active hazards for map display (public)
const getActiveHazards = async (req, res) => {
  try {
    const now = new Date();
    const hazards = await Interaction.find({
      intType: 'hazard',
      isActive: true,
      intLatitude: { $exists: true },
      intLongitude: { $exists: true },
      $or: [
        { expiryTime: { $gt: now } },
        { expiryTime: null },
      ],
    })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(hazards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get all feedback for a specific route
const getRouteFeedback = async (req, res) => {
  try {
    const feedback = await Interaction.find({
      routeId: req.params.routeId,
      intType: 'feedback',
      isActive: true,
    })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(feedback);
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
    deleteInteraction,
    getActiveHazards,
    getRouteFeedback
};