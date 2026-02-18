const Route = require('../models/Route');
const axios = require('axios');

// CREATE Route
const createRoute = async (req, res) => {

  try {
    const { name, coordinates, isPublic } = req.body;
    const userId = "test-user-123"; // Replace with Clerk userId later

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

module.exports = { createRoute };