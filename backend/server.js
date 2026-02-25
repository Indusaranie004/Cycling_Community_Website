const mongoose = require('mongoose');
const app = require('./app');

const {startHazardExpiryJob } = require('./jobs/hazardExpiryJob');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
        console.log('✅ MongoDB connected successfully');
        startHazardExpiryJob(); // start after DB is ready
    })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});