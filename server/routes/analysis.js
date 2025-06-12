const express = require('express');
const router = express.Router();

// Run risk analysis on portfolio
router.post('/run', (req, res) => {
  const { hazardType, intensity, portfolioId, returnPeriod } = req.body;
  
  // In a real app, this would trigger a complex calculation
  // For demo purposes, we'll return mock results
  
  const analysisResults = {
    id: `analysis-${Date.now()}`,
    timestamp: new Date().toISOString(),
    parameters: {
      hazardType,
      intensity,
      portfolioId,
      returnPeriod
    },
    results: {
      totalExpectedLoss: Math.random() * 50000000,
      percentageOfPortfolio: Math.random() * 0.15,
      affectedProperties: Math.floor(Math.random() * 500),
      riskHotspots: [
        { region: 'Miami-Dade, FL', expectedLoss: Math.random() * 10000000 },
        { region: 'Houston, TX', expectedLoss: Math.random() * 8000000 },
        { region: 'New Orleans, LA', expectedLoss: Math.random() * 7000000 }
      ],
      ltvImpact: Math.random() * 0.05
    }
  };
  
  res.json(analysisResults);
});

// Get analysis history
router.get('/history', (req, res) => {
  // Mock history data
  const analysisHistory = [
    {
      id: 'analysis-1',
      timestamp: '2023-11-01T10:15:30Z',
      hazardType: 'flood',
      returnPeriod: 100,
      totalExpectedLoss: 32500000
    },
    {
      id: 'analysis-2',
      timestamp: '2023-11-01T14:22:15Z',
      hazardType: 'fire',
      returnPeriod: 50,
      totalExpectedLoss: 18700000
    }
  ];
  
  res.json(analysisHistory);
});

// Get specific analysis result
router.get('/:analysisId', (req, res) => {
  const { analysisId } = req.params;
  
  // Mock detailed result
  const analysisDetail = {
    id: analysisId,
    timestamp: '2023-11-01T10:15:30Z',
    parameters: {
      hazardType: 'flood',
      intensity: 3.5,
      portfolioId: 'portfolio-main',
      returnPeriod: 100
    },
    results: {
      totalExpectedLoss: 32500000,
      percentageOfPortfolio: 0.087,
      affectedProperties: 342,
      riskHotspots: [
        { region: 'Miami-Dade, FL', expectedLoss: 8750000 },
        { region: 'Houston, TX', expectedLoss: 6200000 },
        { region: 'New Orleans, LA', expectedLoss: 5800000 }
      ],
      ltvImpact: 0.032
    }
  };
  
  res.json(analysisDetail);
});

// Stress test API endpoint
router.post('/stress', (req, res) => {
  const { lat, lon, hazardType, intensity } = req.body;
  
  // Calculate expected loss for a single property
  const expectedLoss = {
    damageRatio: Math.random() * 0.5,
    expectedLossValue: Math.random() * 250000,
    confidenceInterval: [Math.random() * 150000, Math.random() * 350000]
  };
  
  res.json(expectedLoss);
});

module.exports = router;