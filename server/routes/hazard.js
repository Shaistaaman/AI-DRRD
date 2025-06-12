const express = require('express');
const router = express.Router();

// Get available hazard types
router.get('/types', (req, res) => {
  const hazardTypes = [
    { id: 'flood', name: 'Flooding', description: 'River and coastal flooding events' },
    { id: 'fire', name: 'Wildfire', description: 'Forest and brush fire events' },
    { id: 'wind', name: 'Windstorm', description: 'Hurricane, tornado, and high wind events' },
    { id: 'heat', name: 'Heatwave', description: 'Extreme temperature events' }
  ];
  
  res.json(hazardTypes);
});

// Get hazard data for a specific region
router.get('/:hazardType/:regionId', (req, res) => {
  const { hazardType, regionId } = req.params;
  
  // Mock data - in a real app, this would come from a climate data API
  const hazardData = {
    hazardType,
    regionId,
    severity: Math.random() * 5,
    probabilityOfOccurrence: Math.random(),
    affectedProperties: Math.floor(Math.random() * 100),
    geojson: {
      type: 'FeatureCollection',
      features: [
        // GeoJSON features would go here
      ]
    }
  };
  
  res.json(hazardData);
});

// Get historical hazard data
router.get('/historical/:hazardType', (req, res) => {
  const { hazardType } = req.params;
  
  // Mock historical data
  const historicalData = {
    hazardType,
    events: [
      { year: 2023, severity: 4.2, damage: 2.1e9 },
      { year: 2022, severity: 3.8, damage: 1.7e9 },
      { year: 2021, severity: 4.5, damage: 2.3e9 },
      { year: 2020, severity: 3.5, damage: 1.5e9 },
      { year: 2019, severity: 3.0, damage: 1.2e9 }
    ]
  };
  
  res.json(historicalData);
});

module.exports = router;