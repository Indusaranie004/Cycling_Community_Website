const express = require('express');
const cors = require('cors');

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;