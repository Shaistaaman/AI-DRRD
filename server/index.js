require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const portfolioRoutes = require('./routes/portfolio');
const hazardRoutes = require('./routes/hazard');
const analysisRoutes = require('./routes/analysis');
const uploadRoutes = require('./routes/upload');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/hazard', hazardRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));