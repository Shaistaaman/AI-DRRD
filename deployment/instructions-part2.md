# AWS Deployment Instructions - Part 2: DynamoDB Data Setup

## 1. Create Data Import Scripts

Create a directory for data import scripts:

```bash
mkdir -p scripts/data-import
```

### Portfolio Data Import Script

Create `scripts/data-import/portfolio-data.js`:

```javascript
const AWS = require('aws-sdk');
const fs = require('fs');

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1' // Change to your region
});

const docClient = new AWS.DynamoDB.DocumentClient();

// Portfolio summary data
const portfolioData = {
  id: 'portfolio-summary',
  totalLoans: 1250,
  totalValue: 375000000,
  averageLTV: 0.72,
  riskCategories: {
    low: 450,
    medium: 600,
    high: 200
  },
  regions: [
    { name: 'Northeast', count: 300, value: 95000000 },
    { name: 'Southeast', count: 450, value: 125000000 },
    { name: 'Midwest', count: 200, value: 55000000 },
    { name: 'Southwest', count: 150, value: 45000000 },
    { name: 'West', count: 150, value: 55000000 }
  ]
};

// Import portfolio data
const importPortfolioData = async () => {
  const params = {
    TableName: 'aidrrd-portfolio',
    Item: portfolioData
  };

  try {
    await docClient.put(params).promise();
    console.log('Portfolio data imported successfully');
  } catch (err) {
    console.error('Error importing portfolio data:', err);
  }
};

// Run the import
importPortfolioData();
```

### Loan Data Import Script

Create `scripts/data-import/loan-data.js`:

```javascript
const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1' // Change to your region
});

const docClient = new AWS.DynamoDB.DocumentClient();

// Sample loan data
const loanData = [
  // Miami properties
  { 
    id: 'L001', 
    address: '123 Ocean Dr, Miami, FL', 
    value: 450000, 
    balance: 306000,
    ltv: 0.68, 
    risk: 'high',
    lat: 25.7617, 
    lng: -80.1918,
    region: 'Miami',
    yearBuilt: 2005,
    loanType: '30-year fixed',
    interestRate: 4.2,
    monthlyPayment: 1495,
    insuranceCoverage: 400000
  },
  { 
    id: 'L002', 
    address: '456 Biscayne Blvd, Miami, FL', 
    value: 320000, 
    balance: 230400,
    ltv: 0.72, 
    risk: 'medium',
    lat: 25.7827, 
    lng: -80.2094,
    region: 'Miami',
    yearBuilt: 2010,
    loanType: '15-year fixed',
    interestRate: 3.8,
    monthlyPayment: 1680,
    insuranceCoverage: 300000
  },
  // Add more loan data here...
];

// Import loan data
const importLoanData = async () => {
  console.log(`Importing ${loanData.length} loans...`);
  
  for (const loan of loanData) {
    const params = {
      TableName: 'aidrrd-loans',
      Item: loan
    };

    try {
      await docClient.put(params).promise();
      console.log(`Imported loan ${loan.id}`);
    } catch (err) {
      console.error(`Error importing loan ${loan.id}:`, err);
    }
  }
  
  console.log('Loan data import completed');
};

// Run the import
importLoanData();
```

### Weather Data Import Script

Create `scripts/data-import/weather-data.js`:

```javascript
const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1' // Change to your region
});

const docClient = new AWS.DynamoDB.DocumentClient();

// Sample weather data
const weatherData = [
  {
    region: 'Miami',
    weather: { main: 'Rain', description: 'heavy rain', icon: '10d' },
    main: { temp: 28, humidity: 85 },
    wind: { speed: 15, deg: 180 },
    rain: { '1h': 25 },
    alerts: [{ event: 'Flood', description: 'Flash flood warning in effect' }]
  },
  {
    region: 'Houston',
    weather: { main: 'Thunderstorm', description: 'thunderstorm with heavy rain', icon: '11d' },
    main: { temp: 30, humidity: 80 },
    wind: { speed: 20, deg: 220 },
    rain: { '1h': 30 },
    alerts: [{ event: 'Severe Thunderstorm', description: 'Severe thunderstorm warning in effect' }]
  },
  {
    region: 'NewYork',
    weather: { main: 'Clear', description: 'clear sky', icon: '01d' },
    main: { temp: 22, humidity: 60 },
    wind: { speed: 8, deg: 270 }
  },
  {
    region: 'SanFrancisco',
    weather: { main: 'Fog', description: 'fog', icon: '50d' },
    main: { temp: 18, humidity: 75 },
    wind: { speed: 12, deg: 290 }
  },
  {
    region: 'NewOrleans',
    weather: { main: 'Rain', description: 'moderate rain', icon: '10d' },
    main: { temp: 29, humidity: 82 },
    wind: { speed: 18, deg: 200 },
    rain: { '1h': 15 }
  }
];

// Import weather data
const importWeatherData = async () => {
  console.log(`Importing weather data for ${weatherData.length} regions...`);
  
  for (const data of weatherData) {
    const params = {
      TableName: 'aidrrd-weather',
      Item: data
    };

    try {
      await docClient.put(params).promise();
      console.log(`Imported weather data for ${data.region}`);
    } catch (err) {
      console.error(`Error importing weather data for ${data.region}:`, err);
    }
  }
  
  console.log('Weather data import completed');
};

// Run the import
importWeatherData();
```

## 2. Run Data Import Scripts

Install AWS SDK:

```bash
npm install aws-sdk
```

Run the import scripts:

```bash
node scripts/data-import/portfolio-data.js
node scripts/data-import/loan-data.js
node scripts/data-import/weather-data.js
```

## 3. Verify Data Import

Verify the data was imported correctly:

```bash
# Check portfolio data
aws dynamodb scan --table-name aidrrd-portfolio

# Check loan data
aws dynamodb scan --table-name aidrrd-loans

# Check weather data
aws dynamodb scan --table-name aidrrd-weather
```