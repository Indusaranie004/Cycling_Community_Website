const Route = require('../models/Route');
const axios = require('axios');

// CREATE Route
const createRoute = async (req, res) => {

  try {
    const { name, coordinates, isPublic } = req.body;
    const userId = "test-user-789"; // Replace with Clerk userId later

    // Call Mapbox Directions API
    const directionsResponse = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/cycling/${coordinates.map(c => c.join(',')).join(';')}`,
      {
        params: {
          access_token: process.env.MAPBOX_TOKEN,
          geometries: 'geojson'
        }
      }
    );

    const route = directionsResponse.data.routes[0];
    const distance = route.distance;
    const estimatedTime = route.duration / 60; // Convert to minutes

    // Call Mapbox Geocoding API for start location
    const startCoord = coordinates[0];
    const endCoord = coordinates[coordinates.length - 1];

    const startGeocode = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${startCoord[0]},${startCoord[1]}.json`,
      { params: { access_token: process.env.MAPBOX_TOKEN } }
    );

    const endGeocode = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${endCoord[0]},${endCoord[1]}.json`,
      { params: { access_token: process.env.MAPBOX_TOKEN } }
    );

    const startLocation = startGeocode.data.features[0]?.place_name || 'Unknown';
    const endLocation = endGeocode.data.features[0]?.place_name || 'Unknown';

    // Save to MongoDB
    const newRoute = new Route({
      userId,
      name,
      coordinates,
      distance,
      estimatedTime,
      startLocation,
      endLocation,
      isPublic
    });

    await newRoute.save();

    res.status(201).json({
      message: 'Route created successfully',
      route: newRoute
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ Routes
const getRoutes = async (req, res) => {
  try {
    const { userId, isPublic } = req.query;

    // Build query dynamically
    let query = {};

    // Scenario 1: Get user's own routes
    if (userId) {
      query.userId = userId;
      
      // Optional: filter by public/private
      if (isPublic !== undefined) {
        query.isPublic = isPublic === 'true';
      }
    } 
    // Scenario 2: Get all public routes (default)
    else {
      query.isPublic = true;
    }

    const routes = await Route.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Routes retrieved successfully',
      count: routes.length,
      routes
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE Route
const updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, coordinates, isPublic } = req.body;

    // Find existing route
    const existingRoute = await Route.findById(id);
    
    if (!existingRoute) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Build update object - only include fields that are sent
    let updateData = {};
    if (name !== undefined) updateData.name = name;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // Check if coordinates changed
    const coordinatesChanged = coordinates && 
      JSON.stringify(existingRoute.coordinates) !== JSON.stringify(coordinates);

    // If coordinates changed, recalculate everything
    if (coordinatesChanged) {
      // Call Mapbox Directions API
      const directionsResponse = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/cycling/${coordinates.map(c => c.join(',')).join(';')}`,
        {
          params: {
            access_token: process.env.MAPBOX_TOKEN,
            geometries: 'geojson'
          }
        }
      );

      const route = directionsResponse.data.routes[0];
      const distance = route.distance;
      const estimatedTime = route.duration / 60;

      // Call Mapbox Geocoding API
      const startCoord = coordinates[0];
      const endCoord = coordinates[coordinates.length - 1];

      const startGeocode = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${startCoord[0]},${startCoord[1]}.json`,
        { params: { access_token: process.env.MAPBOX_TOKEN } }
      );

      const endGeocode = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${endCoord[0]},${endCoord[1]}.json`,
        { params: { access_token: process.env.MAPBOX_TOKEN } }
      );

      const startLocation = startGeocode.data.features[0]?.place_name || 'Unknown';
      const endLocation = endGeocode.data.features[0]?.place_name || 'Unknown';

      // Add recalculated fields to update
      updateData.coordinates = coordinates;
      updateData.distance = distance;
      updateData.estimatedTime = estimatedTime;
      updateData.startLocation = startLocation;
      updateData.endLocation = endLocation;
    }

    // Update route
    const updatedRoute = await Route.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return updated document
    );

    res.status(200).json({
      message: 'Route updated successfully',
      route: updatedRoute
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE Route
const deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = "test-user-123"; // Replace with Clerk userId later
    const userRole = "user"; // Replace with actual role from Clerk later (user/admin)

    // Find the route
    const route = await Route.findById(id);

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Authorization check: owner OR admin
    const isOwner = route.userId === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden: You do not have permission to delete this route' 
      });
    }

    // Delete the route
    await Route.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Route deleted successfully',
      deletedRouteId: id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export all functions
module.exports = { createRoute, getRoutes, updateRoute, deleteRoute };

