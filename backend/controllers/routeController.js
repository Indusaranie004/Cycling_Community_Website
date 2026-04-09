const Route = require('../models/Route');
const axios = require('axios');

// CREATE Route
const createRoute = async (req, res) => {
  try {
    const { name, coordinates, isPublic } = req.body;
    const userId = req.userId; // From requireAuth middleware

    // Check duplicate name for same user
    const existingRoute = await Route.findOne({ userId, name });
    if (existingRoute) {
      return res.status(409).json({ error: 'You already have a route with this name' });
    }

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

    // Save to MongoDB - with startPoint
    const newRoute = new Route({
      userId,
      name,
      coordinates: route.geometry.coordinates,
      startPoint: {
        type: 'Point',
        coordinates: coordinates[0]  // [longitude, latitude]
      },
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

    let query = {};

    if (userId) {
      query.userId = userId;
      
      // If viewing others' routes, show public only (from middleware flag)
      if (req.showPublicOnly) {
        query.isPublic = true;
      } 
      // If viewing own routes, allow filtering
      else if (isPublic !== undefined) {
        query.isPublic = isPublic === 'true';
      }
    } else {
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
    const existingRoute = req.route; // From checkRouteOwnership middleware
    const { name, coordinates, isPublic } = req.body;

    // Check duplicate name
    if (name && name !== existingRoute.name) {
      const duplicateName = await Route.findOne({ userId: req.userId, name });
      if (duplicateName) {
        return res.status(409).json({ error: 'You already have a route with this name' });
      }
    }

    let updateData = {};
    if (name !== undefined) updateData.name = name;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const coordinatesChanged = coordinates && 
      JSON.stringify(existingRoute.coordinates) !== JSON.stringify(coordinates);

    if (coordinatesChanged) {
      const directionsResponse = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/cycling/${coordinates.map(c => c.join(',')).join(';')}`,
        { params: { access_token: process.env.MAPBOX_TOKEN, geometries: 'geojson' }}
      );

      const route = directionsResponse.data.routes[0];
      const startCoord = coordinates[0];
      const endCoord = coordinates[coordinates.length - 1];

      const startGeocode = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${startCoord[0]},${startCoord[1]}.json`,
        { params: { access_token: process.env.MAPBOX_TOKEN }}
      );

      const endGeocode = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${endCoord[0]},${endCoord[1]}.json`,
        { params: { access_token: process.env.MAPBOX_TOKEN }}
      );

      updateData.coordinates = route.geometry.coordinates;
      updateData.startPoint = {
        type: 'Point',
        coordinates: coordinates[0]  // Update start point too
      };
      updateData.distance = route.distance;
      updateData.estimatedTime = route.duration / 60;
      updateData.startLocation = startGeocode.data.features[0]?.place_name || 'Unknown';
      updateData.endLocation = endGeocode.data.features[0]?.place_name || 'Unknown';
    }

    const updatedRoute = await Route.findByIdAndUpdate(
      existingRoute._id,
      updateData,
      { new: true }
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
    const route = req.route; // From checkRouteOwnership middleware

    await Route.findByIdAndDelete(route._id);

    res.status(200).json({
      message: 'Route deleted successfully',
      deletedRouteId: route._id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// NEARBY Routes
const getNearbyRoutes = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    // radius in meters, default 5km

    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'lat and lng query parameters are required' 
      });
    }

    const routes = await Route.find({
      isPublic: true,
      startPoint: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius)
        }
      }
    });

    res.status(200).json({
      message: 'Nearby routes retrieved successfully',
      count: routes.length,
      routes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createRoute, getRoutes, updateRoute, deleteRoute, getNearbyRoutes };