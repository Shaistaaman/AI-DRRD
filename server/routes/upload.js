const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

// Configure storage to save to data folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dataDir = path.join(__dirname, '../data');
    // Create directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    cb(null, dataDir);
  },
  filename: function (req, file, cb) {
    // Save as portfolio.csv to replace existing data
    if (path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, 'portfolio.csv');
    } else {
      cb(null, `portfolio-${Date.now()}${path.extname(file.originalname)}`);
    }
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls', '.json'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV, Excel, and JSON files are allowed.'));
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper function to analyze portfolio data
const analyzePortfolioData = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stats = {
      totalLoans: 0,
      validLoans: 0,
      invalidLoans: 0,
      totalOriginalUPB: 0,
      totalCurrentUPB: 0,
      delinquentLoans: 0,
      averageLTV: 0,
      averageCreditScore: 0,
      stateDistribution: {},
      riskDistribution: { low: 0, medium: 0, high: 0 }
    };

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
        stats.totalLoans++;

        // Validate required fields for comprehensive schema
        const requiredFields = ['loan_identifier', 'original_upb', 'original_ltv', 'borrower_credit_score', 'property_state'];
        const hasRequiredFields = requiredFields.every(field => data[field] && data[field].trim() !== '');

        if (hasRequiredFields) {
          stats.validLoans++;

          // Calculate financial metrics
          const originalUPB = parseFloat(data.original_upb || 0);
          const currentUPB = parseFloat(data.current_actual_upb || originalUPB);
          const ltv = parseFloat(data.original_ltv || 0);
          const creditScore = parseFloat(data.borrower_credit_score || 0);
          const delinquencyStatus = parseInt(data.current_loan_delinquency_status || 0);

          stats.totalOriginalUPB += originalUPB;
          stats.totalCurrentUPB += currentUPB;
          stats.averageLTV += ltv;
          stats.averageCreditScore += creditScore;

          if (delinquencyStatus > 0) {
            stats.delinquentLoans++;
          }

          // State distribution
          const state = data.property_state || 'Unknown';
          stats.stateDistribution[state] = (stats.stateDistribution[state] || 0) + 1;

          // Risk categorization based on LTV and credit score
          if (ltv <= 70 && creditScore >= 740) {
            stats.riskDistribution.low++;
          } else if (ltv <= 85 && creditScore >= 680) {
            stats.riskDistribution.medium++;
          } else {
            stats.riskDistribution.high++;
          }
        } else {
          stats.invalidLoans++;
        }
      })
      .on('end', () => {
        // Calculate averages
        if (stats.validLoans > 0) {
          stats.averageLTV = Math.round((stats.averageLTV / stats.validLoans) * 100) / 100;
          stats.averageCreditScore = Math.round(stats.averageCreditScore / stats.validLoans);
        }

        resolve(stats);
      })
      .on('error', (error) => reject(error));
  });
};

// Test endpoint to check if upload route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Upload route is working', timestamp: new Date().toISOString() });
});

// Upload portfolio file
router.post('/', upload.single('portfolio'), async (req, res) => {
  try {
    console.log('Upload request received');

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log('File uploaded:', req.file.filename, 'Path:', req.file.path);

    // Check if file exists
    if (!fs.existsSync(req.file.path)) {
      console.log('File does not exist at path:', req.file.path);
      return res.status(500).json({
        success: false,
        error: 'Uploaded file not found'
      });
    }

    // Analyze the uploaded portfolio data
    const filePath = req.file.path;
    console.log('Starting data analysis...');
    const stats = await analyzePortfolioData(filePath);
    console.log('Analysis complete:', stats);

    // Format total value with proper currency formatting
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    };

    // Safe division for delinquency rate
    const delinquencyRate = stats.validLoans > 0 ?
      ((stats.delinquentLoans / stats.validLoans) * 100).toFixed(2) : '0.00';

    const response = {
      success: true,
      message: 'Portfolio data uploaded and analyzed successfully!',
      file: req.file.filename,
      details: {
        loansProcessed: stats.totalLoans,
        validLoans: stats.validLoans,
        invalidLoans: stats.invalidLoans,
        totalValue: formatCurrency(stats.totalOriginalUPB),
        currentValue: formatCurrency(stats.totalCurrentUPB),
        averageLTV: `${stats.averageLTV}%`,
        averageCreditScore: stats.averageCreditScore,
        delinquentLoans: stats.delinquentLoans,
        delinquencyRate: `${delinquencyRate}%`
      },
      analytics: {
        riskDistribution: stats.riskDistribution,
        stateDistribution: stats.stateDistribution,
        portfolioHealth: {
          creditQuality: stats.averageCreditScore >= 720 ? 'Excellent' :
            stats.averageCreditScore >= 680 ? 'Good' :
              stats.averageCreditScore >= 620 ? 'Fair' : 'Poor',
          ltvRisk: stats.averageLTV <= 70 ? 'Low' :
            stats.averageLTV <= 85 ? 'Moderate' : 'High',
          delinquencyRisk: stats.validLoans > 0 ?
            ((stats.delinquentLoans / stats.validLoans) <= 0.02 ? 'Low' :
              (stats.delinquentLoans / stats.validLoans) <= 0.05 ? 'Moderate' : 'High') : 'Low'
        }
      }
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process portfolio file',
      message: error.message,
      stack: error.stack
    });
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