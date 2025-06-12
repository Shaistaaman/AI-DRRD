# AWS Deployment Instructions - Part 3: Lambda Functions

## 1. Create Lambda Functions

Create a directory for Lambda functions:

```bash
mkdir -p lambda-functions
```

### Portfolio API Lambda

Create `lambda-functions/portfolio-api/index.js`:

```javascript
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  const path = event.path;
  const method = event.httpMethod;
  const pathParams = event.pathParameters || {};
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
  };
  
  // Handle OPTIONS requests (CORS preflight)
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({})
    };
  }
  
  try {
    // Get portfolio summary
    if (path === '/api/portfolio' && method === 'GET') {
      const params = {
        TableName: 'aidrrd-portfolio',
        Key: { id: 'portfolio-summary' }
      };
      
      const result = await docClient.get(params).promise();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Item || {})
      };
    }
    
    // Get all loans
    if (path === '/api/loans' && method === 'GET') {
      const params = {
        TableName: 'aidrrd-loans'
      };
      
      const result = await docClient.scan(params).promise();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Items || [])
      };
    }
    
    // Get loans by region
    if (path.startsWith('/api/loans/region/') && method === 'GET') {
      const region = pathParams.region;
      
      const params = {
        TableName: 'aidrrd-loans',
        FilterExpression: '#region = :region',
        ExpressionAttributeNames: {
          '#region': 'region'
        },
        ExpressionAttributeValues: {
          ':region': region
        }
      };
      
      const result = await docClient.scan(params).promise();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Items || [])
      };
    }
    
    // Get loan by ID
    if (path.startsWith('/api/loans/') && method === 'GET') {
      const loanId = pathParams.id;
      
      const params = {
        TableName: 'aidrrd-loans',
        Key: { id: loanId }
      };
      
      const result = await docClient.get(params).promise();
      
      if (!result.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Loan not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Item)
      };
    }
    
    // Route not found
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Not Found' })
    };
    
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};
```

### Weather API Lambda

Create `lambda-functions/weather-api/index.js`:

```javascript
const AWS = require('aws-sdk');
const axios = require('axios');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  const path = event.path;
  const method = event.httpMethod;
  const queryParams = event.queryStringParameters || {};
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE'
  };
  
  // Handle OPTIONS requests (CORS preflight)
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({})
    };
  }
  
  try {
    // Get weather data by region
    if (path === '/api/weather' && method === 'GET') {
      const region = queryParams.region;
      
      if (!region) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Region parameter is required' })
        };
      }
      
      // Get weather data from DynamoDB
      const params = {
        TableName: 'aidrrd-weather',
        Key: { region }
      };
      
      const result = await docClient.get(params).promise();
      
      if (!result.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Weather data not found for this region' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Item)
      };
    }
    
    // Get weather forecast by coordinates
    if (path === '/api/weather/forecast' && method === 'GET') {
      const lat = queryParams.lat;
      const lon = queryParams.lon;
      
      if (!lat || !lon) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Latitude and longitude parameters are required' })
        };
      }
      
      // In a real implementation, you would call a weather API here
      // For demo purposes, we'll return mock data
      const mockForecast = {
        lat,
        lon,
        daily: [
          {
            dt: Date.now() / 1000,
            temp: { day: 28, min: 24, max: 32 },
            weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
            pop: 0.7
          },
          {
            dt: Date.now() / 1000 + 86400,
            temp: { day: 29, min: 25, max: 33 },
            weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
            pop: 0.1
          }
        ]
      };
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(mockForecast)
      };
    }
    
    // Route not found
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Not Found' })
    };
    
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};
```

### AI Assistant Lambda

Create `lambda-functions/ai-assistant/index.js`:

```javascript
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

// Knowledge base for common questions
const knowledgeBase = {
  'portfolio risk': 'Your portfolio has properties across multiple regions with varying risk levels. The highest risk areas are currently in Miami and Houston due to flood and hurricane threats.',
  'weather forecast': 'Current weather forecasts show increased precipitation in coastal areas, with potential storm systems developing in the Southeast region.',
  'risk mitigation': 'To mitigate risks, consider diversifying your portfolio across different geographical regions and investing in properties with climate-resilient features.',
  'property value': 'Property values in high-risk areas may experience volatility due to increasing insurance costs and climate-related concerns.',
  'insurance': 'Insurance premiums for properties in high-risk flood zones have increased by an average of 12% in the past year.',
  'climate change': 'Climate models project increased frequency and severity of extreme weather events, particularly in coastal and wildfire-prone regions.'
};

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  const method = event.httpMethod;
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,POST'
  };
  
  // Handle OPTIONS requests (CORS preflight)
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({})
    };
  }
  
  try {
    if (method !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method Not Allowed' })
      };
    }
    
    const body = JSON.parse(event.body || '{}');
    const query = body.query;
    
    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Query parameter is required' })
      };
    }
    
    // Get portfolio data
    const portfolioParams = {
      TableName: 'aidrrd-portfolio',
      Key: { id: 'portfolio-summary' }
    };
    
    const portfolioResult = await docClient.get(portfolioParams).promise();
    const portfolioData = portfolioResult.Item;
    
    // Generate response based on query
    let response = '';
    const queryLower = query.toLowerCase();
    
    // Check for specific question types
    if (queryLower.includes('portfolio') && queryLower.includes('risk')) {
      const highRiskCount = portfolioData.riskCategories.high;
      const totalLoans = portfolioData.totalLoans;
      const highRiskPercentage = ((highRiskCount / totalLoans) * 100).toFixed(1);
      
      response = `Your portfolio currently has ${highRiskCount} high-risk properties out of ${totalLoans} total loans (${highRiskPercentage}%). The highest concentration of risk is in the Southeast region, primarily due to flood and hurricane exposure.`;
    }
    else if (queryLower.includes('expected loss') || queryLower.includes('financial impact')) {
      const totalValue = portfolioData.totalValue;
      const estimatedLoss = totalValue * 0.08; // 8% estimated loss for demo purposes
      
      response = `Based on current risk assessments, the estimated potential loss across your portfolio is approximately $${(estimatedLoss / 1000000).toFixed(1)} million, which represents about 8% of your total portfolio value.`;
    }
    else {
      // Generic response using knowledge base
      for (const [key, value] of Object.entries(knowledgeBase)) {
        if (queryLower.includes(key)) {
          response = value;
          break;
        }
      }
      
      // Fallback response
      if (!response) {
        response = "I can help you analyze your portfolio's climate risk exposure, provide weather insights, and recommend risk mitigation strategies. Could you please clarify what specific information you're looking for?";
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        text: response,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};
```

## 2. Package Lambda Functions

Create a deployment package for each Lambda function:

```bash
# Portfolio API Lambda
cd lambda-functions/portfolio-api
npm init -y
npm install aws-sdk
zip -r ../portfolio-api.zip .

# Weather API Lambda
cd ../weather-api
npm init -y
npm install aws-sdk axios
zip -r ../weather-api.zip .

# AI Assistant Lambda
cd ../ai-assistant
npm init -y
npm install aws-sdk
zip -r ../ai-assistant.zip .

cd ../..
```

## 3. Deploy Lambda Functions

Deploy the Lambda functions:

```bash
# Portfolio API Lambda
aws lambda create-function \
  --function-name aidrrd-portfolio-api \
  --runtime nodejs14.x \
  --handler index.handler \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --zip-file fileb://lambda-functions/portfolio-api.zip

# Weather API Lambda
aws lambda create-function \
  --function-name aidrrd-weather-api \
  --runtime nodejs14.x \
  --handler index.handler \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --zip-file fileb://lambda-functions/weather-api.zip

# AI Assistant Lambda
aws lambda create-function \
  --function-name aidrrd-ai-assistant \
  --runtime nodejs14.x \
  --handler index.handler \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --zip-file fileb://lambda-functions/ai-assistant.zip
```

Note: Replace `YOUR_ACCOUNT_ID` with your actual AWS account ID and ensure you have created the appropriate IAM role with permissions to access DynamoDB and other required services.