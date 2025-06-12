# AWS Deployment Instructions - Part 1: Setup and Infrastructure

## Prerequisites
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js and npm installed
- Git repository for the project

## 1. AWS Services Overview

This deployment will use the following AWS services:
- **Amazon S3**: Static file hosting for the React frontend
- **Amazon DynamoDB**: NoSQL database for portfolio and risk data
- **AWS Lambda**: Serverless functions for API endpoints
- **Amazon API Gateway**: API management and routing
- **Amazon CloudFront**: Content delivery network for the frontend
- **AWS Cognito**: User authentication (optional)
- **AWS Amplify**: Simplified deployment and hosting (alternative option)

## 2. Infrastructure Setup with CloudFormation

Create a CloudFormation template (`infrastructure.yaml`) to set up the core infrastructure:

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

## 3. Deploy Infrastructure

Deploy the CloudFormation template:

```bash
aws cloudformation create-stack \
  --stack-name aidrrd-infrastructure \
  --template-body file://infrastructure.yaml \
  --capabilities CAPABILITY_IAM
```

Wait for the stack creation to complete:

```bash
aws cloudformation wait stack-create-complete --stack-name aidrrd-infrastructure
```

Get the outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name aidrrd-infrastructure \
  --query "Stacks[0].Outputs"
```

Save these output values for use in subsequent steps.