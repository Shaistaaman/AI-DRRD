# AWS Deployment Instructions for AIDRRD

This document provides step-by-step instructions for deploying the AI-Powered Disaster Risk Resilience Dashboard (AIDRRD) to AWS.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [DynamoDB Data Setup](#dynamodb-data-setup)
4. [Lambda Functions](#lambda-functions)
5. [API Gateway Configuration](#api-gateway-configuration)
6. [Frontend Deployment](#frontend-deployment)
7. [Testing](#testing)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js and npm installed
- Git repository for the project

### Required Dependencies

The application requires additional Node.js packages for enhanced file upload and comprehensive CSV processing:

```bash
# Core dependencies for CSV processing and file upload
npm install csv-parser multer

# Additional dependencies for enhanced functionality
npm install fs path express cors dotenv

# Note: The upload functionality now includes:
# - Real-time CSV analysis and validation with 110+ field support
# - Automatic portfolio metrics calculation and risk assessment
# - Enhanced file size limits (50MB) with intelligent file handling
# - Comprehensive data quality reporting with detailed analytics
# - GSE loan performance data schema compatibility
# - Advanced risk categorization based on LTV and credit score thresholds
```

### Server Middleware Configuration

The Express.js server includes enhanced middleware for robust request handling:

```javascript
// Enhanced middleware stack in server/index.js
app.use(cors()) // Cross-origin resource sharing
app.use(express.json()) // JSON request body parsing
app.use(express.urlencoded({ extended: true })) // URL-encoded form data parsing
```

This configuration ensures:

- **Form Data Processing**: Handles HTML form submissions and file uploads
- **JSON API Support**: Processes REST API requests with JSON payloads
- **URL-encoded Data**: Supports query parameters and form-encoded data
- **Cross-origin Requests**: Enables frontend-backend communication across domains

### Data Requirements

The application now supports the complete GSE loan performance data schema with 110+ fields. While only a few fields are required, the system can process and expose all available loan data fields through the API.

**Minimum Required Fields:**

- `loan_identifier`: Unique loan ID
- `original_upb`: Original unpaid principal balance
- `original_ltv`: Original loan-to-value ratio
- `borrower_credit_score`: Borrower's credit score
- `property_state`: Property state code

**Comprehensive Schema Support:**

The API now processes and exposes all GSE standard fields including:

**Core Loan Data:**

- `reference_pool_id`, `monthly_reporting_period`, `channel`
- `seller_name`, `servicer_name`, `master_servicer`

**Financial Metrics:**

- `current_actual_upb`, `upb_at_issuance`, `interest_bearing_upb`
- `original_interest_rate`, `current_interest_rate`
- `original_loan_term`, `loan_age`, `remaining_months_maturity`

**Credit & Risk Assessment:**

- `co_borrower_credit_score`, `borrower_credit_score_current`
- `original_cltv`, `dti`, `current_loan_delinquency_status`
- `loan_payment_history`, `modification_flag`

**Property & Geographic Data:**

- `property_type`, `number_of_units`, `occupancy_status`
- `msa`, `zip_code`, `mortgage_insurance_percentage`

**Servicing & Loss Data:**

- `foreclosure_date`, `disposition_date`, `foreclosure_costs`
- `net_sales_proceeds`, `principal_forgiveness_amount`
- `scheduled_principal_current`, `total_principal_current`

**Regulatory & Compliance:**

- `special_eligibility_program`, `high_balance_loan_indicator`
- `relocation_mortgage_indicator`, `deal_name`

This comprehensive data support enables:

- **Advanced Risk Analytics**: Detailed loan-level risk assessment
- **Regulatory Reporting**: Full compliance with GSE data standards
- **Portfolio Analysis**: Deep insights into loan performance and characteristics
- **Real-time Processing**: Instant analysis and validation of uploaded data

## Infrastructure Setup

### AWS Services Overview

This deployment uses the following AWS services:

- **Amazon S3**: Static file hosting for the React frontend
- **Amazon DynamoDB**: NoSQL database for portfolio and risk data
- **AWS Lambda**: Serverless functions for API endpoints
- **Amazon API Gateway**: API management and routing
- **Amazon CloudFront**: Content delivery network for the frontend
- **AWS Cognito**: User authentication (optional)

### CloudFormation Template

Create a file named `infrastructure.yaml` with the following content:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'AIDRRD Application Infrastructure'

Resources:
  # S3 Bucket for Frontend
  FrontendBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: aidrrd-frontend
      AccessControl: PublicRead
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: index.html

  # S3 Bucket Policy
  FrontendBucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref FrontendBucket
      PolicyDocument:
        Statement:
          - Effect: Allow
            Principal: '*'
            Action: 's3:GetObject'
            Resource: !Join ['', ['arn:aws:s3:::', !Ref FrontendBucket, '/*']]

  # DynamoDB Tables
  PortfolioTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: aidrrd-portfolio
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH

  LoanTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: aidrrd-loans
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH

  WeatherDataTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: aidrrd-weather
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: region
          AttributeType: S
      KeySchema:
        - AttributeName: region
          KeyType: HASH

  # API Gateway
  ApiGateway:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: aidrrd-api
      Description: API for AIDRRD Application

Outputs:
  FrontendBucketName:
    Description: Name of the S3 bucket for frontend hosting
    Value: !Ref FrontendBucket

  PortfolioTableName:
    Description: Name of the DynamoDB table for portfolio data
    Value: !Ref PortfolioTable

  LoanTableName:
    Description: Name of the DynamoDB table for loan data
    Value: !Ref LoanTable

  WeatherDataTableName:
    Description: Name of the DynamoDB table for weather data
    Value: !Ref WeatherDataTable

  ApiGatewayId:
    Description: ID of the API Gateway
    Value: !Ref ApiGateway
```

### Deploy Infrastructure

```bash
# Set your AWS region
export AWS_REGION=us-east-1

# Deploy CloudFormation stack
aws cloudformation create-stack \
  --stack-name aidrrd-infrastructure \
  --template-body file://infrastructure.yaml \
  --capabilities CAPABILITY_IAM

# Wait for stack creation to complete
aws cloudformation wait stack-create-complete --stack-name aidrrd-infrastructure

# Get outputs
aws cloudformation describe-stacks \
  --stack-name aidrrd-infrastructure \
  --query "Stacks[0].Outputs"
```

## DynamoDB Data Setup

### Create Data Import Scripts

Create a directory for data import scripts:

```bash
mkdir -p scripts/data-import
```

#### Portfolio Data Script

The application now uses CSV-based data processing. Create `scripts/data-import/portfolio-data.js`:

```javascript
const AWS = require('aws-sdk')
const fs = require('fs')
const csv = require('csv-parser')
const path = require('path')

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1'
})

const docClient = new AWS.DynamoDB.DocumentClient()

// Read and process CSV data
const processPortfolioCSV = async () => {
  const results = []
  const csvPath = path.join(__dirname, '../../server/data/portfolio.csv')

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => {
        console.log(`Processed ${results.length} loan records`)
        resolve(results)
      })
      .on('error', error => reject(error))
  })
}

// Import portfolio data to DynamoDB
const importPortfolioData = async () => {
  try {
    const portfolioData = await processPortfolioCSV()

    // Calculate summary metrics
    const summary = {
      id: 'portfolio-summary',
      totalLoans: portfolioData.length,
      totalOriginalUPB: portfolioData.reduce(
        (sum, loan) => sum + parseFloat(loan.original_upb || 0),
        0
      ),
      totalCurrentUPB: portfolioData.reduce(
        (sum, loan) => sum + parseFloat(loan.current_actual_upb || 0),
        0
      ),
      averageLTV:
        portfolioData.reduce(
          (sum, loan) => sum + parseFloat(loan.original_ltv || 0),
          0
        ) / portfolioData.length,
      riskCategories: portfolioData.reduce((acc, loan) => {
        const risk = loan.risk_level || 'unknown'
        acc[risk] = (acc[risk] || 0) + 1
        return acc
      }, {}),
      regions: portfolioData.reduce((acc, loan) => {
        const region = loan.region || 'Unknown'
        if (!acc[region]) {
          acc[region] = {
            name: region,
            count: 0,
            originalValue: 0,
            currentValue: 0
          }
        }
        acc[region].count++
        acc[region].originalValue += parseFloat(loan.original_upb || 0)
        acc[region].currentValue += parseFloat(loan.current_actual_upb || 0)
        return acc
      }, {})
    }

    // Store summary in DynamoDB
    await docClient
      .put({
        TableName: 'aidrrd-portfolio',
        Item: summary
      })
      .promise()

    // Store individual loan records
    for (const loan of portfolioData) {
      await docClient
        .put({
          TableName: 'aidrrd-loans',
          Item: {
            id: loan.loan_identifier,
            ...loan
          }
        })
        .promise()
    }

    console.log('Portfolio data imported successfully')
  } catch (err) {
    console.error('Error importing portfolio data:', err)
  }
}

// Run the import
importPortfolioData()
```

#### Loan Data Script

Create `scripts/data-import/loan-data.js` with the loan data from your portfolio service.

#### Weather Data Script

Create `scripts/data-import/weather-data.js` with the weather data from your weather service.

### Run Data Import Scripts

```bash
# Install dependencies
npm install aws-sdk

# Run import scripts
node scripts/data-import/portfolio-data.js
node scripts/data-import/loan-data.js
node scripts/data-import/weather-data.js
```

## Lambda Functions

### Create Lambda Function Code

Create directories for each Lambda function:

```bash
mkdir -p lambda-functions/portfolio-api
mkdir -p lambda-functions/weather-api
mkdir -p lambda-functions/ai-assistant
mkdir -p lambda-functions/upload-api
```

#### Upload API Lambda Function

Create `lambda-functions/upload-api/index.js` for handling portfolio file uploads with real-time CSV analysis:

```javascript
const AWS = require('aws-sdk')
const multipart = require('aws-lambda-multipart-parser')
const csv = require('csv-parser')
const { Readable } = require('stream')

const s3 = new AWS.S3()
const docClient = new AWS.DynamoDB.DocumentClient()

// Helper function to analyze portfolio data from CSV content
const analyzePortfolioData = csvContent => {
  return new Promise((resolve, reject) => {
    const results = []
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
    }

    const stream = Readable.from([csvContent])

    stream
      .pipe(csv())
      .on('data', data => {
        results.push(data)
        stats.totalLoans++

        // Validate required fields
        const requiredFields = [
          'loan_identifier',
          'original_upb',
          'original_ltv',
          'borrower_credit_score'
        ]
        const hasRequiredFields = requiredFields.every(
          field => data[field] && data[field].trim() !== ''
        )

        if (hasRequiredFields) {
          stats.validLoans++

          // Calculate financial metrics
          const originalUPB = parseFloat(data.original_upb || 0)
          const currentUPB = parseFloat(data.current_actual_upb || originalUPB)
          const ltv = parseFloat(data.original_ltv || 0)
          const creditScore = parseFloat(data.borrower_credit_score || 0)
          const delinquencyStatus = parseInt(
            data.current_loan_delinquency_status || 0
          )

          stats.totalOriginalUPB += originalUPB
          stats.totalCurrentUPB += currentUPB
          stats.averageLTV += ltv
          stats.averageCreditScore += creditScore

          if (delinquencyStatus > 0) {
            stats.delinquentLoans++
          }

          // State distribution
          const state = data.property_state || 'Unknown'
          stats.stateDistribution[state] =
            (stats.stateDistribution[state] || 0) + 1

          // Risk categorization based on LTV and credit score
          if (ltv <= 70 && creditScore >= 740) {
            stats.riskDistribution.low++
          } else if (ltv <= 85 && creditScore >= 680) {
            stats.riskDistribution.medium++
          } else {
            stats.riskDistribution.high++
          }
        } else {
          stats.invalidLoans++
        }
      })
      .on('end', () => {
        // Calculate averages
        if (stats.validLoans > 0) {
          stats.averageLTV =
            Math.round((stats.averageLTV / stats.validLoans) * 100) / 100
          stats.averageCreditScore = Math.round(
            stats.averageCreditScore / stats.validLoans
          )
        }

        resolve(stats)
      })
      .on('error', error => reject(error))
  })
}

exports.handler = async event => {
  console.log('Received event:', JSON.stringify(event, null, 2))

  const method = event.httpMethod

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,POST'
  }

  // Handle OPTIONS requests (CORS preflight)
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({})
    }
  }

  try {
    if (method !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: 'Method Not Allowed' })
      }
    }

    // Parse multipart form data
    const result = multipart.parse(event, true)

    if (!result.portfolio) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file uploaded' })
      }
    }

    const file = result.portfolio
    const fileName = file.filename.toLowerCase().endsWith('.csv')
      ? 'portfolio.csv'
      : `portfolio-${Date.now()}.${file.filename.split('.').pop()}`

    // Upload file to S3
    const uploadParams = {
      Bucket: 'aidrrd-uploads',
      Key: fileName,
      Body: file.content,
      ContentType: file.contentType
    }

    await s3.upload(uploadParams).promise()

    // Analyze CSV data if it's a CSV file
    let analysisResults
    if (file.filename.toLowerCase().endsWith('.csv')) {
      const stats = await analyzePortfolioData(file.content.toString())

      // Format currency values
      const formatCurrency = amount => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(amount)
      }

      analysisResults = {
        success: true,
        message: 'Portfolio data uploaded and analyzed successfully!',
        file: fileName,
        details: {
          loansProcessed: stats.totalLoans,
          validLoans: stats.validLoans,
          invalidLoans: stats.invalidLoans,
          totalValue: formatCurrency(stats.totalOriginalUPB),
          currentValue: formatCurrency(stats.totalCurrentUPB),
          averageLTV: `${stats.averageLTV}%`,
          averageCreditScore: stats.averageCreditScore,
          delinquentLoans: stats.delinquentLoans,
          delinquencyRate: `${(
            (stats.delinquentLoans / stats.validLoans) *
            100
          ).toFixed(2)}%`
        },
        analytics: {
          riskDistribution: stats.riskDistribution,
          stateDistribution: stats.stateDistribution,
          portfolioHealth: {
            creditQuality:
              stats.averageCreditScore >= 720
                ? 'Excellent'
                : stats.averageCreditScore >= 680
                ? 'Good'
                : stats.averageCreditScore >= 620
                ? 'Fair'
                : 'Poor',
            ltvRisk:
              stats.averageLTV <= 70
                ? 'Low'
                : stats.averageLTV <= 85
                ? 'Moderate'
                : 'High',
            delinquencyRisk:
              stats.delinquentLoans / stats.validLoans <= 0.02
                ? 'Low'
                : stats.delinquentLoans / stats.validLoans <= 0.05
                ? 'Moderate'
                : 'High'
          }
        }
      }
    } else {
      // For non-CSV files, return basic upload confirmation
      analysisResults = {
        success: true,
        message: 'File uploaded successfully!',
        file: fileName,
        note: 'Advanced analysis is available for CSV files only'
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(analysisResults)
    }
  } catch (error) {
    console.error('Error:', error)

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to process portfolio file',
        message: error.message
      })
    }
  }
}
```

Create the Lambda function code files as described in the detailed instructions.

### Package and Deploy Lambda Functions

```bash
# Create IAM role for Lambda
aws iam create-role \
  --role-name lambda-execution-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

# Attach policies
aws iam attach-role-policy \
  --role-name lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Wait for role to be available
sleep 10

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

# Package and deploy Lambda functions
cd lambda-functions/portfolio-api
npm init -y
npm install aws-sdk
zip -r ../portfolio-api.zip .
cd ../..

cd lambda-functions/weather-api
npm init -y
npm install aws-sdk axios
zip -r ../weather-api.zip .
cd ../..

cd lambda-functions/ai-assistant
npm init -y
npm install aws-sdk
zip -r ../ai-assistant.zip .
cd ../..

# Create Lambda functions
aws lambda create-function \
  --function-name aidrrd-portfolio-api \
  --runtime nodejs14.x \
  --handler index.handler \
  --role arn:aws:iam::$ACCOUNT_ID:role/lambda-execution-role \
  --zip-file fileb://lambda-functions/portfolio-api.zip

aws lambda create-function \
  --function-name aidrrd-weather-api \
  --runtime nodejs14.x \
  --handler index.handler \
  --role arn:aws:iam::$ACCOUNT_ID:role/lambda-execution-role \
  --zip-file fileb://lambda-functions/weather-api.zip

aws lambda create-function \
  --function-name aidrrd-ai-assistant \
  --runtime nodejs14.x \
  --handler index.handler \
  --role arn:aws:iam::$ACCOUNT_ID:role/lambda-execution-role \
  --zip-file fileb://lambda-functions/ai-assistant.zip
```

## API Gateway Configuration

### Set Up API Resources and Methods

```bash
# Get the API Gateway ID
API_ID=$(aws cloudformation describe-stacks \
  --stack-name aidrrd-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayId'].OutputValue" \
  --output text)

# Create API resources and methods
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --query "items[0].id" \
  --output text)

# Create API resources
API_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_RESOURCE_ID \
  --path-part "api" \
  --query "id" \
  --output text)

# Create endpoints for portfolio, loans, weather, and AI
# (See detailed instructions for complete API Gateway setup)
```

### Deploy the API

```bash
# Create deployment
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod

# Get the API URL
API_URL=$(aws apigateway get-stage \
  --rest-api-id $API_ID \
  --stage-name prod \
  --query "invokeUrl" \
  --output text)

echo "API URL: $API_URL"
```

## Frontend Deployment

### Update Frontend Configuration

Create a configuration file for the frontend:

```bash
cat > client/src/config.js << EOL
const config = {
  apiUrl: '${API_URL}',
  region: '${AWS_REGION}'
};

export default config;
EOL
```

### Build and Deploy Frontend

```bash
# Build the React application
cd client
npm install
npm run build
cd ..

# Get the S3 bucket name
S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name aidrrd-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text)

# Upload files to S3
aws s3 sync client/build/ s3://$S3_BUCKET/ --delete

# Get the website URL
WEBSITE_URL="http://$S3_BUCKET.s3-website-$AWS_REGION.amazonaws.com"
echo "Website URL: $WEBSITE_URL"
```

## Testing

### Test API Endpoints

```bash
# Test portfolio endpoint
curl -X GET ${API_URL}/api/portfolio

# Test weather endpoint
curl -X GET ${API_URL}/api/weather?region=Miami

# Test AI assistant endpoint
curl -X POST ${API_URL}/api/ai \
  -H "Content-Type: application/json" \
  -d '{"query": "What is my portfolio risk?"}'
```

### Test Frontend

Open the website URL in a browser and verify that:

1. The dashboard loads correctly
2. Risk maps display properly
3. Portfolio data is visible
4. The AI assistant responds to queries

## Monitoring and Maintenance

### Set Up CloudWatch Alarms

```bash
# Create CloudWatch alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name "Lambda-Errors" \
  --alarm-description "Alarm when Lambda functions have errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:$AWS_REGION:$ACCOUNT_ID:NotifyMe

# Create CloudWatch alarm for API Gateway 5xx errors
aws cloudwatch put-metric-alarm \
  --alarm-name "API-Gateway-5XX-Errors" \
  --alarm-description "Alarm when API Gateway returns 5XX errors" \
  --metric-name 5XXError \
  --namespace AWS/ApiGateway \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1 \
  --dimensions Name=ApiName,Value=aidrrd-api \
  --alarm-actions arn:aws:sns:$AWS_REGION:$ACCOUNT_ID:NotifyMe
```

### Backup Strategy

```bash
# Set up DynamoDB backups
aws dynamodb update-continuous-backups \
  --table-name aidrrd-portfolio \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

aws dynamodb update-continuous-backups \
  --table-name aidrrd-loans \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

aws dynamodb update-continuous-backups \
  --table-name aidrrd-weather \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

## Conclusion

Your AIDRRD application is now deployed on AWS with:

- Static frontend hosted on S3
- Mock data stored in DynamoDB
- Serverless API powered by Lambda and API Gateway
- AI assistant capabilities

For production use, consider adding:

- Custom domain name with Route 53
- SSL certificate with AWS Certificate Manager
- User authentication with Amazon Cognito
- CI/CD pipeline with AWS CodePipeline
