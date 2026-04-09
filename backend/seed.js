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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  name: String,
  startLocation: String,
  endLocation: String,
  coordinates: [[Number]],
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

/**
 * Generates a coordinate offset to ensure meaningful distance (5km - 20km).
 * 0.1 degrees is roughly 11km.
 */
const getMeaningfulOffset = () => {
  const min = 0.06; // ~6.5km
  const max = 0.18; // ~20km
  const offset = Math.random() * (max - min) + min;
  return Math.random() > 0.5 ? offset : -offset;
};

// --- API Helpers ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getMapboxDirections = async (start, end) => {
  const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
  const response = await axios.get(url);
  return response.data.routes[0];
};

const getPlaceName = async (lng, lat) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`;
  const response = await axios.get(url);
  // Return a shortened name (e.g., "Hikkaduwa") or the first part of the full address
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
    console.log(`Created ${createdUsers.length} users`);

    for (let i = 0; i < TOTAL_ROUTES; i++) {
      let startBase;

      // Concentration Logic
      if (i < 15) {
        startBase = baseLocations.ambalangoda;
      } else if (i < 30) {
        startBase = baseLocations.malabe;
      } else {
        startBase = baseLocations.others[i % baseLocations.others.length];
      }

      // Generate meaningful distance start and end
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
        
        // Wait slightly between directions and geocoding to respect rate limits
        await sleep(DELAY_MS);
        const startName = await getPlaceName(start.lng, start.lat);
        const endName = await getPlaceName(end.lng, end.lat);

        await Route.create({
          userId: createdUsers[i % createdUsers.length]._id,
          name: `${startName} to ${endName} Cycling`,
          startLocation: startName,
          endLocation: endName,
          coordinates: routeData.geometry.coordinates, // Road-snapped path
          distance: routeData.distance, // in meters
          estimatedTime: routeData.duration, // in seconds
          isPublic: i % 4 !== 0, // 75% public, 25% private
          startPoint: {
            type: 'Point',
            coordinates: [start.lng, start.lat],
          },
        });

        console.log(`[${i + 1}/${TOTAL_ROUTES}] Created: ${startName} -> ${endName} (${(routeData.distance/1000).toFixed(2)}km)`);
        
        // Final delay before next loop iteration
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