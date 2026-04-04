const Interaction = require('../../models/InteractionModel');

// Check if the logged-in user owns the interaction
const checkInteractionOwnership = async (req, res, next) => {
    try {
        const userId = req.userId;           // set by requireAuth
        const userRole = req.userRole;       // set by requireAuth
        const interaction = await Interaction.findById(req.params.id);

        if (!interaction) {
            return res.status(404).json({ error: 'Interaction not found' });
        }

        const isOwner = interaction.userId.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ 
                error: 'Forbidden: You do not have permission to modify this interaction' 
            });
        }

        req.interaction = interaction;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { checkInteractionOwnership };