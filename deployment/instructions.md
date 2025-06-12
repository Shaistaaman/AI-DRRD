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

Create `scripts/data-import/portfolio-data.js`:

```javascript
const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1'
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