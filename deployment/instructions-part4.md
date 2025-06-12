# AWS Deployment Instructions - Part 4: API Gateway and Frontend Deployment

## 1. Configure API Gateway

### Create API Resources and Methods

```bash
# Get the API Gateway ID
API_ID=$(aws cloudformation describe-stacks \
  --stack-name aidrrd-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayId'].OutputValue" \
  --output text)

# Create resources
RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $(aws apigateway get-resources --rest-api-id $API_ID --query "items[0].id" --output text) \
  --path-part api \
  --query id --output text)

PORTFOLIO_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $RESOURCE_ID \
  --path-part portfolio \
  --query id --output text)

LOANS_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $RESOURCE_ID \
  --path-part loans \
  --query id --output text)

WEATHER_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $RESOURCE_ID \
  --path-part weather \
  --query id --output text)

AI_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $RESOURCE_ID \
  --path-part ai \
  --query id --output text)

# Create methods for portfolio resource
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $PORTFOLIO_RESOURCE_ID \
  --http-method GET \
  --authorization-type NONE

# Create methods for loans resource
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $LOANS_RESOURCE_ID \
  --http-method GET \
  --authorization-type NONE

# Create methods for weather resource
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $WEATHER_RESOURCE_ID \
  --http-method GET \
  --authorization-type NONE

# Create methods for AI resource
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $AI_RESOURCE_ID \
  --http-method POST \
  --authorization-type NONE
```

### Connect API Gateway to Lambda Functions

```bash
# Get Lambda function ARNs
PORTFOLIO_LAMBDA_ARN=$(aws lambda get-function \
  --function-name aidrrd-portfolio-api \
  --query "Configuration.FunctionArn" \
  --output text)

WEATHER_LAMBDA_ARN=$(aws lambda get-function \
  --function-name aidrrd-weather-api \
  --query "Configuration.FunctionArn" \
  --output text)

AI_LAMBDA_ARN=$(aws lambda get-function \
  --function-name aidrrd-ai-assistant \
  --query "Configuration.FunctionArn" \
  --output text)

# Set up integrations
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $PORTFOLIO_RESOURCE_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/${PORTFOLIO_LAMBDA_ARN}/invocations

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $LOANS_RESOURCE_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/${PORTFOLIO_LAMBDA_ARN}/invocations

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $WEATHER_RESOURCE_ID \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/${WEATHER_LAMBDA_ARN}/invocations

aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $AI_RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/${AI_LAMBDA_ARN}/invocations
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

## 2. Update Frontend Configuration

Create a configuration file for the frontend to use the API endpoints:

```bash
cat > client/src/config.js << EOL
const config = {
  apiUrl: '${API_URL}',
  region: '${AWS_REGION}'
};

export default config;
EOL
```

## 3. Build and Deploy Frontend

Build the React application:

```bash
cd client
npm install
npm run build
cd ..
```

Deploy the built files to S3:

```bash
# Get the S3 bucket name
S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name aidrrd-infrastructure \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text)

# Upload files to S3
aws s3 sync client/build/ s3://$S3_BUCKET/ --delete
```

## 4. Set Up CloudFront (Optional)

For better performance and HTTPS support, set up CloudFront:

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name ${S3_BUCKET}.s3.amazonaws.com \
  --default-root-object index.html \
  --query "Distribution.DomainName" \
  --output text
```

## 5. Update Service Endpoints

If you're using CloudFront, update the frontend configuration:

```bash
# Get CloudFront domain
CF_DOMAIN=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[0].DomainName=='${S3_BUCKET}.s3.amazonaws.com'].DomainName" \
  --output text)

# Update config
cat > client/src/config.js << EOL
const config = {
  apiUrl: '${API_URL}',
  region: '${AWS_REGION}',
  cdnUrl: 'https://${CF_DOMAIN}'
};

export default config;
EOL

# Rebuild and redeploy
cd client
npm run build
cd ..
aws s3 sync client/build/ s3://$S3_BUCKET/ --delete
```

## 6. Test the Deployment

Test the API endpoints:

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

Visit the website:
- If using S3 website hosting: `http://${S3_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com`
- If using CloudFront: `https://${CF_DOMAIN}`