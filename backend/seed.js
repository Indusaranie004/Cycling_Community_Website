const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://Indusaranie:Chathumi2004@cluster0.muofx1q.mongodb.net/?appName=Cluster0';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  savedRoutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
});

const RouteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

const FavouriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
});

const User = mongoose.model('User', UserSchema);
const Route = mongoose.model('Route', RouteSchema);
const Favourite = mongoose.model('Favourite', FavouriteSchema);

const users = [
  { name: 'Amal Perera', email: 'amal@test.com' },
  { name: 'Nimal Silva', email: 'nimal@test.com' },
  { name: 'Kamali Fernando', email: 'kamali@test.com' },
  { name: 'Ruwan Jayasinghe', email: 'ruwan@test.com' },
  { name: 'Dilini Wickrama', email: 'dilini@test.com' },
  { name: 'Saman Kumara', email: 'saman@test.com' },
  { name: 'Priya Mendis', email: 'priya@test.com' },
  { name: 'Thilak Bandara', email: 'thilak@test.com' },
  { name: 'Sandya Rathnayake', email: 'sandya@test.com' },
  { name: 'Chathura Dissanayake', email: 'chathura@test.com' },
  { name: 'Iresha Gunawardena', email: 'iresha@test.com' },
  { name: 'Lasith Malinga', email: 'lasith@test.com' },
  { name: 'Nadeesha Rodrigo', email: 'nadeesha@test.com' },
  { name: 'Buddhika Pathirana', email: 'buddhika@test.com' },
  { name: 'Chamari Athapaththu', email: 'chamari@test.com' },
  { name: 'Dinesh Chandimal', email: 'dinesh@test.com' },
  { name: 'Oshada Fernando', email: 'oshada@test.com' },
  { name: 'Kaushal Silva', email: 'kaushal@test.com' },
  { name: 'Minodi Perera', email: 'minodi@test.com' },
  { name: 'Tharaka Rajapaksha', email: 'tharaka@test.com' },
  { name: 'Sachini Nisansala', email: 'sachini@test.com' },
  { name: 'Prasad Liyanage', email: 'prasad@test.com' },
  { name: 'Hasini Jayawardena', email: 'hasini@test.com' },
  { name: 'Nuwan Kulasekara', email: 'nuwan@test.com' },
  { name: 'Malsha Peiris', email: 'malsha@test.com' },
  { name: 'Gayan Wickramasinghe', email: 'gayan@test.com' },
  { name: 'Supun Madushanka', email: 'supun@test.com' },
  { name: 'Hiruni Amarasinghe', email: 'hiruni@test.com' },
  { name: 'Danushka Gunathilaka', email: 'danushka@test.com' },
  { name: 'Thilini Beligoda', email: 'thilini@test.com' },
  { name: 'Asela Gunaratne', email: 'asela@test.com' },
  { name: 'Pavithra Wanigasekara', email: 'pavithra@test.com' },
  { name: 'Rangana Herath', email: 'rangana@test.com' },
  { name: 'Ama Kanchana', email: 'ama@test.com' },
  { name: 'Suranga Lakmal', email: 'suranga@test.com' },
  { name: 'Dimuth Karunaratne', email: 'dimuth@test.com' },
  { name: 'Niluka Madushani', email: 'niluka@test.com' },
  { name: 'Akila Dananjaya', email: 'akila@test.com' },
  { name: 'Rashmi Dias', email: 'rashmi@test.com' },
  { name: 'Vishwa Fernando', email: 'vishwa@test.com' },
  { name: 'Imesha Dulani', email: 'imesha@test.com' },
  { name: 'Bhanuka Rajapaksa', email: 'bhanuka@test.com' },
  { name: 'Chathurika Peiris', email: 'chathurika@test.com' },
  { name: 'Dhananjaya de Silva', email: 'dhananjaya@test.com' },
  { name: 'Sewwandi Jayasinghe', email: 'sewwandi@test.com' },
  { name: 'Lahiru Thirimanne', email: 'lahiru@test.com' },
  { name: 'Chaminda Vaas', email: 'chaminda@test.com' },
  { name: 'Upeksha Swarnamali', email: 'upeksha@test.com' },
  { name: 'Jehan Mubarak', email: 'jehan@test.com' },
  { name: 'Anushka Sanjeewani', email: 'anushka@test.com' },
];

const routeData = [
  {
    name: 'Colombo Coastal Ride',
    startLocation: 'Galle Face Green',
    endLocation: 'Mount Lavinia',
    isPublic: true,
    coordinates: [
      [79.8478, 6.9271], [79.8490, 6.9210], [79.8505, 6.9150],
      [79.8512, 6.9090], [79.8520, 6.9030], [79.8530, 6.8970],
      [79.8545, 6.8910], [79.8558, 6.8850], [79.8570, 6.8790],
      [79.8580, 6.8730], [79.8592, 6.8670], [79.8600, 6.8610],
    ],
    distance: 8200, estimatedTime: 32,
  },
  {
    name: 'Kandy Lake Loop',
    startLocation: 'Kandy Lake',
    endLocation: 'Kandy Lake',
    isPublic: true,
    coordinates: [
      [80.6350, 7.2906], [80.6380, 7.2920], [80.6410, 7.2935],
      [80.6440, 7.2945], [80.6460, 7.2940], [80.6470, 7.2925],
      [80.6460, 7.2905], [80.6440, 7.2890], [80.6410, 7.2880],
      [80.6380, 7.2882], [80.6360, 7.2890], [80.6350, 7.2906],
    ],
    distance: 4500, estimatedTime: 20,
  },
  {
    name: 'Galle Fort Perimeter',
    startLocation: 'Galle Fort Entrance',
    endLocation: 'Galle Fort Lighthouse',
    isPublic: true,
    coordinates: [
      [80.2170, 6.0270], [80.2180, 6.0260], [80.2195, 6.0250],
      [80.2210, 6.0245], [80.2225, 6.0248], [80.2235, 6.0255],
      [80.2240, 6.0265], [80.2238, 6.0278], [80.2228, 6.0285],
      [80.2215, 6.0288], [80.2200, 6.0285], [80.2188, 6.0278],
    ],
    distance: 3200, estimatedTime: 15,
  },
  {
    name: 'Negombo Beach Trail',
    startLocation: 'Negombo Beach',
    endLocation: 'Negombo Lagoon',
    isPublic: true,
    coordinates: [
      [79.8383, 7.2084], [79.8390, 7.2120], [79.8395, 7.2160],
      [79.8400, 7.2200], [79.8405, 7.2240], [79.8408, 7.2280],
      [79.8410, 7.2320], [79.8415, 7.2360], [79.8420, 7.2400],
      [79.8425, 7.2440], [79.8428, 7.2480], [79.8430, 7.2520],
    ],
    distance: 6100, estimatedTime: 26,
  },
  {
    name: 'Nuwara Eliya Hill Climb',
    startLocation: 'Nuwara Eliya Town',
    endLocation: 'Horton Plains',
    isPublic: false,
    coordinates: [
      [80.7718, 6.9497], [80.7700, 6.9520], [80.7680, 6.9545],
      [80.7660, 6.9570], [80.7640, 6.9598], [80.7618, 6.9625],
      [80.7595, 6.9650], [80.7570, 6.9675], [80.7545, 6.9700],
      [80.7520, 6.9725], [80.7495, 6.9750], [80.7470, 6.9775],
    ],
    distance: 12400, estimatedTime: 55,
  },
  {
    name: 'Trincomalee Shoreline',
    startLocation: 'Trincomalee Harbour',
    endLocation: 'Nilaveli Beach',
    isPublic: true,
    coordinates: [
      [81.2330, 8.5667], [81.2340, 8.5720], [81.2350, 8.5775],
      [81.2358, 8.5830], [81.2365, 8.5885], [81.2370, 8.5940],
      [81.2374, 8.5995], [81.2376, 8.6050], [81.2375, 8.6105],
      [81.2372, 8.6160], [81.2368, 8.6215], [81.2362, 8.6270],
    ],
    distance: 9800, estimatedTime: 40,
  },
  {
    name: 'Ella Rock Trail',
    startLocation: 'Ella Town',
    endLocation: 'Ella Rock Summit',
    isPublic: false,
    coordinates: [
      [81.0460, 6.8670], [81.0445, 6.8690], [81.0428, 6.8712],
      [81.0410, 6.8735], [81.0392, 6.8758], [81.0374, 6.8782],
      [81.0356, 6.8806], [81.0338, 6.8830], [81.0320, 6.8855],
      [81.0302, 6.8880], [81.0284, 6.8905], [81.0266, 6.8930],
    ],
    distance: 7300, estimatedTime: 45,
  },
  {
    name: 'Jaffna Peninsula Ride',
    startLocation: 'Jaffna Fort',
    endLocation: 'Point Pedro',
    isPublic: true,
    coordinates: [
      [80.0088, 9.6615], [80.0120, 9.6680], [80.0155, 9.6745],
      [80.0192, 9.6810], [80.0230, 9.6875], [80.0270, 9.6940],
      [80.0312, 9.7005], [80.0355, 9.7070], [80.0400, 9.7135],
      [80.0446, 9.7200], [80.0494, 9.7265], [80.0543, 9.7330],
    ],
    distance: 15600, estimatedTime: 62,
  },
  {
    name: 'Mirissa Whale Watch Route',
    startLocation: 'Mirissa Harbour',
    endLocation: 'Weligama Bay',
    isPublic: true,
    coordinates: [
      [80.4550, 5.9480], [80.4580, 5.9500], [80.4612, 5.9518],
      [80.4645, 5.9532], [80.4678, 5.9544], [80.4712, 5.9554],
      [80.4746, 5.9562], [80.4780, 5.9568], [80.4814, 5.9572],
      [80.4848, 5.9574], [80.4882, 5.9574], [80.4916, 5.9572],
    ],
    distance: 7800, estimatedTime: 33,
  },
  {
    name: 'Sigiriya Countryside Loop',
    startLocation: 'Sigiriya Rock',
    endLocation: 'Pidurangala',
    isPublic: true,
    coordinates: [
      [80.7597, 7.9570], [80.7610, 7.9590], [80.7625, 7.9612],
      [80.7640, 7.9635], [80.7652, 7.9658], [80.7660, 7.9682],
      [80.7665, 7.9706], [80.7668, 7.9730], [80.7668, 7.9754],
      [80.7665, 7.9778], [80.7660, 7.9802], [80.7652, 7.9825],
    ],
    distance: 5500, estimatedTime: 28,
  },
  {
    name: 'Polonnaruwa Ancient City',
    startLocation: 'Polonnaruwa Museum',
    endLocation: 'Parakrama Samudra',
    isPublic: true,
    coordinates: [
      [81.0020, 7.9395], [81.0035, 7.9410], [81.0052, 7.9428],
      [81.0070, 7.9448], [81.0088, 7.9468], [81.0105, 7.9488],
      [81.0120, 7.9508], [81.0133, 7.9528], [81.0144, 7.9548],
      [81.0153, 7.9568], [81.0160, 7.9588], [81.0165, 7.9608],
    ],
    distance: 6800, estimatedTime: 30,
  },
  {
    name: 'Batticaloa Lagoon Ride',
    startLocation: 'Batticaloa Fort',
    endLocation: 'Kallady Bridge',
    isPublic: false,
    coordinates: [
      [81.6920, 7.7170], [81.6935, 7.7190], [81.6948, 7.7212],
      [81.6958, 7.7235], [81.6965, 7.7258], [81.6970, 7.7282],
      [81.6972, 7.7306], [81.6972, 7.7330], [81.6970, 7.7354],
      [81.6965, 7.7378], [81.6958, 7.7402], [81.6948, 7.7425],
    ],
    distance: 8900, estimatedTime: 38,
  },
  {
    name: 'Anuradhapura Sacred City',
    startLocation: 'Ruwanwelisaya',
    endLocation: 'Jetavanaramaya',
    isPublic: true,
    coordinates: [
      [80.3960, 8.3480], [80.3972, 8.3498], [80.3985, 8.3518],
      [80.3998, 8.3538], [80.4010, 8.3558], [80.4020, 8.3578],
      [80.4028, 8.3598], [80.4034, 8.3618], [80.4038, 8.3638],
      [80.4040, 8.3658], [80.4040, 8.3678], [80.4038, 8.3698],
    ],
    distance: 4200, estimatedTime: 22,
  },
  {
    name: 'Hikkaduwa Reef Road',
    startLocation: 'Hikkaduwa Beach',
    endLocation: 'Coral Gardens',
    isPublic: true,
    coordinates: [
      [80.1010, 6.1390], [80.1025, 6.1375], [80.1040, 6.1360],
      [80.1055, 6.1345], [80.1070, 6.1330], [80.1085, 6.1315],
      [80.1100, 6.1300], [80.1115, 6.1285], [80.1130, 6.1270],
      [80.1145, 6.1255], [80.1160, 6.1240], [80.1175, 6.1225],
    ],
    distance: 5100, estimatedTime: 23,
  },
  {
    name: 'Matara Southern Coast',
    startLocation: 'Matara Fort',
    endLocation: 'Polhena Beach',
    isPublic: true,
    coordinates: [
      [80.5430, 5.9490], [80.5448, 5.9478], [80.5466, 5.9465],
      [80.5484, 5.9452], [80.5502, 5.9439], [80.5520, 5.9426],
      [80.5538, 5.9413], [80.5556, 5.9400], [80.5574, 5.9387],
      [80.5592, 5.9374], [80.5610, 5.9361], [80.5628, 5.9348],
    ],
    distance: 4700, estimatedTime: 21,
  },
  {
    name: 'Dambulla Cave Temple Route',
    startLocation: 'Dambulla Town',
    endLocation: 'Cave Temple Summit',
    isPublic: false,
    coordinates: [
      [80.6486, 7.8568], [80.6498, 7.8582], [80.6510, 7.8598],
      [80.6522, 7.8615], [80.6532, 7.8632], [80.6540, 7.8650],
      [80.6546, 7.8668], [80.6550, 7.8686], [80.6552, 7.8704],
      [80.6552, 7.8722], [80.6550, 7.8740], [80.6546, 7.8758],
    ],
    distance: 3800, estimatedTime: 25,
  },
  {
    name: 'Ratnapura Gem City Ride',
    startLocation: 'Ratnapura Town',
    endLocation: 'Sinharaja Border',
    isPublic: true,
    coordinates: [
      [80.3990, 6.6825], [80.3972, 6.6808], [80.3952, 6.6790],
      [80.3930, 6.6772], [80.3908, 6.6754], [80.3885, 6.6736],
      [80.3862, 6.6718], [80.3838, 6.6700], [80.3814, 6.6682],
      [80.3790, 6.6664], [80.3766, 6.6646], [80.3742, 6.6628],
    ],
    distance: 11200, estimatedTime: 48,
  },
  {
    name: 'Kurunegala Rock Fortress',
    startLocation: 'Kurunegala Town',
    endLocation: 'Ethagala Rock',
    isPublic: true,
    coordinates: [
      [80.3630, 7.4868], [80.3645, 7.4882], [80.3660, 7.4898],
      [80.3672, 7.4915], [80.3682, 7.4932], [80.3690, 7.4950],
      [80.3695, 7.4968], [80.3698, 7.4986], [80.3698, 7.5004],
      [80.3696, 7.5022], [80.3692, 7.5040], [80.3686, 7.5058],
    ],
    distance: 4300, estimatedTime: 20,
  },
  {
    name: 'Puttalam Lagoon Loop',
    startLocation: 'Puttalam Town',
    endLocation: 'Mundal Lake',
    isPublic: false,
    coordinates: [
      [79.8280, 8.0350], [79.8298, 8.0368], [79.8318, 8.0388],
      [79.8338, 8.0408], [79.8358, 8.0428], [79.8378, 8.0448],
      [79.8398, 8.0468], [79.8418, 8.0488], [79.8438, 8.0508],
      [79.8458, 8.0528], [79.8478, 8.0548], [79.8498, 8.0568],
    ],
    distance: 10500, estimatedTime: 44,
  },
  {
    name: 'Hambantota Port Road',
    startLocation: 'Hambantota Port',
    endLocation: 'Bundala National Park',
    isPublic: true,
    coordinates: [
      [81.1210, 6.1248], [81.1230, 6.1262], [81.1252, 6.1278],
      [81.1275, 6.1295], [81.1298, 6.1312], [81.1322, 6.1330],
      [81.1346, 6.1348], [81.1370, 6.1366], [81.1394, 6.1384],
      [81.1418, 6.1402], [81.1442, 6.1420], [81.1466, 6.1438],
    ],
    distance: 13200, estimatedTime: 52,
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing seed data
  await User.deleteMany({ email: { $in: users.map(u => u.email) } });
  await Route.deleteMany({ name: { $in: routeData.map(r => r.name) } });

  // Create users
  const createdUsers = [];
  for (const u of users) {
    const hashed = await bcrypt.hash('password123', 10);
    const user = await User.create({ ...u, password: hashed });
    createdUsers.push(user);
  }
  console.log('Users created:', createdUsers.length);

  // Create routes distributed across users
  const createdRoutes = [];
  for (let i = 0; i < routeData.length; i++) {
    const owner = createdUsers[i % createdUsers.length];
    const rd = routeData[i];
    const route = await Route.create({
      userId: owner._id,
      name: rd.name,
      startLocation: rd.startLocation,
      endLocation: rd.endLocation,
      coordinates: rd.coordinates,
      distance: rd.distance,
      estimatedTime: rd.estimatedTime,
      isPublic: rd.isPublic,
      startPoint: {
        type: 'Point',
        coordinates: rd.coordinates[0],
      },
    });
    createdRoutes.push(route);
  }
  console.log('Routes created:', createdRoutes.length);

  // Create favourites — first 5 users each save 3 routes owned by others
  for (let u = 0; u < 5; u++) {
    const currentUser = createdUsers[u];
    const otherRoutes = createdRoutes.filter(r => !r.userId.equals(currentUser._id));
    for (const route of otherRoutes.slice(0, 3)) {
      await Favourite.create({ userId: currentUser._id, routeId: route._id });
    }
  }
  console.log('Favourites created');

  console.log('\nSeed complete. All users have password: password123');
  console.log('Sample credentials:');
  users.slice(0, 5).forEach(u => console.log(`  ${u.email} / password123`));

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });