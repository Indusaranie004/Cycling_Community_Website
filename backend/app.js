const express = require('express');
const cors = require('cors');

const rideRoutes = require('./routes/rideRoutes');
const impactRoutes = require('./routes/ecoImpactRoutes');
const communityRoutes = require('./routes/communityRoutes');
const scheduleMonthlyEmails = require('./jobs/monthlyReportJob');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api/routes', require('./routes/routeRoutes'));

app.use('/api/community/events', require('./routes/communityEventRoutes'));
app.use('/api/community/challenges', require('./routes/communityChallengeRoutes'));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/favourites', require('./routes/favouriteRoutes'));
app.use('/api/interactions', require('./routes/interactionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rides', rideRoutes);            // Endpoint: http://localhost:3001/api/rides
app.use('/api/impact', impactRoutes);         // Endpoint: http://localhost:3001/api/impact
app.use('/api/community-stats', communityRoutes); // Endpoint: http://localhost:3001/api/community-stats

scheduleMonthlyEmails(); 


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;