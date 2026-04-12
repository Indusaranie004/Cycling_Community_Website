const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

// --- Schemas ---
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  savedRoutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
});

const RouteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Fixed ref to User
  name: String,
  startLocation: String,
  endLocation: String,
  waypoints: [[Number]], // Added for editing (small array)
  coordinates: [[Number]], // Detailed snapped geometry
  distance: Number,
  estimatedTime: Number,
  isPublic: { type: Boolean, default: true },
  startPoint: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
});

const User = mongoose.model('User', UserSchema);
const Route = mongoose.model('Route', RouteSchema);

// --- Helpers ---

/**
 * Samples a large coordinate array down to a maximum number of points.
 * Ensures the first and last points are always included.
 */
const sampleWaypoints = (coords, maxPoints = 5) => {
  if (coords.length <= maxPoints) return coords;
  
  const sampled = [];
  const step = (coords.length - 1) / (maxPoints - 1);
  
  for (let i = 0; i < maxPoints; i++) {
    const index = Math.round(i * step);
    sampled.push(coords[index]);
  }
  
  return sampled;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Configuration ---
const TOTAL_ROUTES = 100;
const DELAY_MS = 300; 

const baseLocations = {
  ambalangoda: { lng: 80.0535, lat: 6.2353 },
  malabe: { lng: 79.9731, lat: 6.9021 },
  others: [
    { name: 'Colombo', lng: 79.8612, lat: 6.9271 },
    { name: 'Kandy', lng: 80.6337, lat: 7.2906 },
    { name: 'Galle', lng: 80.2170, lat: 6.0329 },
    { name: 'Jaffna', lng: 80.0103, lat: 9.6615 },
    { name: 'Trincomalee', lng: 81.2335, lat: 8.5873 },
    { name: 'Nuwara Eliya', lng: 80.7718, lat: 6.9497 },
    { name: 'Negombo', lng: 79.8358, lat: 7.2089 },
    { name: 'Batticaloa', lng: 81.6975, lat: 7.7102 },
  ]
};

const getMeaningfulOffset = () => {
  const min = 0.06;
  const max = 0.18;
  const offset = Math.random() * (max - min) + min;
  return Math.random() > 0.5 ? offset : -offset;
};

// --- API Helpers ---
const getMapboxDirections = async (start, end) => {
  const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
  const response = await axios.get(url);
  return response.data.routes[0];
};

const getPlaceName = async (lng, lat) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`;
  const response = await axios.get(url);
  const feature = response.data.features[0];
  return feature ? feature.text || feature.place_name.split(',')[0] : "Unknown Road";
};

// --- Seed Logic ---
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Route.deleteMany({});
    console.log('Cleared existing users and routes');

    const usersData = [
      { name: 'Amal Perera', email: 'amal@test.com' },
      { name: 'Nimal Silva', email: 'nimal@test.com' },
      { name: 'Kamali Fernando', email: 'kamali@test.com' },
      { name: 'Ruwan Jayasinghe', email: 'ruwan@test.com' },
      { name: 'Dilini Wickrama', email: 'dilini@test.com' },
    ];

    const createdUsers = [];
    const hashedPassword = await bcrypt.hash('password123', 10);
    for (const u of usersData) {
      const user = await User.create({ ...u, password: hashedPassword });
      createdUsers.push(user);
    }

    for (let i = 0; i < TOTAL_ROUTES; i++) {
      let startBase;
      if (i < 15) startBase = baseLocations.ambalangoda;
      else if (i < 30) startBase = baseLocations.malabe;
      else startBase = baseLocations.others[i % baseLocations.others.length];

      const start = { 
        lng: startBase.lng + (Math.random() - 0.5) * 0.02, 
        lat: startBase.lat + (Math.random() - 0.5) * 0.02 
      };
      const end = { 
        lng: start.lng + getMeaningfulOffset(), 
        lat: start.lat + getMeaningfulOffset() 
      };

      try {
        const routeData = await getMapboxDirections(start, end);
        await sleep(DELAY_MS);
        
        const startName = await getPlaceName(start.lng, start.lat);
        const endName = await getPlaceName(end.lng, end.lat);

        // Extract full geometry
        const fullCoordinates = routeData.geometry.coordinates;

        await Route.create({
          userId: createdUsers[i % createdUsers.length]._id,
          name: `${startName} to ${endName} Cycling`,
          startLocation: startName,
          endLocation: endName,
          waypoints: sampleWaypoints(fullCoordinates, 5), // Added this line
          coordinates: fullCoordinates,
          distance: routeData.distance,
          estimatedTime: routeData.duration,
          isPublic: i % 4 !== 0,
          startPoint: {
            type: 'Point',
            coordinates: [start.lng, start.lat],
          },
        });

        console.log(`[${i + 1}/${TOTAL_ROUTES}] Created: ${startName} -> ${endName} (Waypoints generated)`);
        await sleep(DELAY_MS);
      } catch (err) {
        console.error(`Error generating route ${i}:`, err.response?.data || err.message);
      }
    }

    console.log('Seeding process finished successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding critical failure:', err);
    process.exit(1);
  }
}

seed();