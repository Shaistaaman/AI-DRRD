const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `portfolio-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload portfolio file
router.post('/', upload.single('portfolio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In a real app, this would process the file and analyze the data
    // For demo purposes, we'll return mock results
    
    const analysisResults = {
      totalProperties: 156,
      totalValue: 47500000,
      riskExposure: {
        flood: 12500000,
        fire: 8700000,
        wind: 9200000,
        heat: 5800000
      },
      riskDistribution: [
        { name: 'Low Risk', value: 68 },
        { name: 'Medium Risk', value: 72 },
        { name: 'High Risk', value: 16 }
      ],
      regionalExposure: [
        { name: 'Northeast', value: 12500000 },
        { name: 'Southeast', value: 18700000 },
        { name: 'Midwest', value: 5800000 },
        { name: 'Southwest', value: 4300000 },
        { name: 'West', value: 6200000 }
      ],
      weatherImpact: {
        currentConditions: 'Heavy rainfall in Southeast region',
        affectedProperties: 23,
        potentialLoss: 3700000
      }
    };
    
    res.json({
      success: true,
      file: req.file.filename,
      results: analysisResults
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current weather conditions
router.get('/weather', (req, res) => {
  // In a real app, this would fetch data from a weather API
  const weatherData = {
    conditions: 'Heavy rainfall in Southeast region',
    alerts: [
      {
        type: 'Flood',
        severity: 'Warning',
        region: 'Southeast',
        affectedProperties: 23,
        potentialLoss: 3700000
      }
    ]
  };
  
  res.json(weatherData);
});

module.exports = router;