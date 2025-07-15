# AWS Deployment Instructions - Part 2: DynamoDB Data Setup

## 1. Create Data Import Scripts

Create a directory for data import scripts:

```bash
mkdir -p scripts/data-import
```

### Portfolio Data Import Script

Create `scripts/data-import/portfolio-data.js` with enhanced CSV processing capabilities:

```javascript
const AWS = require('aws-sdk')
const fs = require('fs')
const csv = require('csv-parser')
const path = require('path')

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1' // Change to your region
})

const docClient = new AWS.DynamoDB.DocumentClient()

// Read and process CSV data with comprehensive GSE schema support
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

// Import portfolio data with comprehensive analytics
const importPortfolioData = async () => {
  try {
    const portfolioData = await processPortfolioCSV()

    // Calculate comprehensive summary metrics
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
      averageCreditScore:
        portfolioData.reduce(
          (sum, loan) => sum + parseFloat(loan.borrower_credit_score || 0),
          0
        ) / portfolioData.length,
      averageDTI:
        portfolioData.reduce(
          (sum, loan) => sum + parseFloat(loan.dti || 0),
          0
        ) / portfolioData.length,
      riskCategories: portfolioData.reduce((acc, loan) => {
        const ltv = parseFloat(loan.original_ltv || 0)
        const creditScore = parseFloat(loan.borrower_credit_score || 0)

        // Risk categorization based on LTV and credit score
        let risk = 'medium'
        if (ltv <= 70 && creditScore >= 740) {
          risk = 'low'
        } else if (ltv > 85 || creditScore < 620) {
          risk = 'high'
        }

        acc[risk] = (acc[risk] || 0) + 1
        return acc
      }, {}),
      regions: portfolioData.reduce((acc, loan) => {
        const state = loan.property_state || 'Unknown'
        if (!acc[state]) {
          acc[state] = {
            name: state,
            count: 0,
            originalValue: 0,
            currentValue: 0
          }
        }
        acc[state].count++
        acc[state].originalValue += parseFloat(loan.original_upb || 0)
        acc[state].currentValue += parseFloat(loan.current_actual_upb || 0)
        return acc
      }, {}),
      delinquencyStats: portfolioData.reduce(
        (acc, loan) => {
          const status = parseInt(loan.current_loan_delinquency_status || 0)
          if (status === 0) acc.current++
          else if (status <= 30) acc.early++
          else if (status <= 90) acc.moderate++
          else acc.severe++
          return acc
        },
        { current: 0, early: 0, moderate: 0, severe: 0 }
      ),
      performanceMetrics: {
        weightedAverageAge:
          portfolioData.reduce(
            (sum, loan) => sum + parseFloat(loan.loan_age || 0),
            0
          ) / portfolioData.length,
        averageRemainingTerm:
          portfolioData.reduce(
            (sum, loan) =>
              sum +
              (parseFloat(loan.original_loan_term || 0) -
                parseFloat(loan.loan_age || 0)),
            0
          ) / portfolioData.length
      }
    }

    // Store comprehensive summary in DynamoDB
    await docClient
      .put({
        TableName: 'aidrrd-portfolio',
        Item: summary
      })
      .promise()

    // Store individual loan records with all GSE fields
    for (const loan of portfolioData) {
      const loanRecord = {
        id: loan.loan_identifier,
        // Core loan identification
        referencePoolId: loan.reference_pool_id,
        monthlyReportingPeriod: loan.monthly_reporting_period,
        channel: loan.channel,
        sellerName: loan.seller_name,
        servicerName: loan.servicer_name,
        masterServicer: loan.master_servicer,

        // Financial metrics
        originalInterestRate: parseFloat(loan.original_interest_rate || 0),
        currentInterestRate: parseFloat(loan.current_interest_rate || 0),
        originalUPB: parseFloat(loan.original_upb || 0),
        upbAtIssuance: parseFloat(loan.upb_at_issuance || 0),
        currentActualUPB: parseFloat(loan.current_actual_upb || 0),
        originalLoanTerm: parseInt(loan.original_loan_term || 0),

        // Dates
        originationDate: loan.origination_date,
        firstPaymentDate: loan.first_payment_date,
        maturityDate: loan.maturity_date,

        // Credit and risk
        originalLTV: parseFloat(loan.original_ltv || 0),
        originalCLTV: parseFloat(loan.original_cltv || 0),
        numberOfBorrowers: parseInt(loan.number_of_borrowers || 1),
        dti: parseFloat(loan.dti || 0),
        borrowerCreditScore: parseInt(loan.borrower_credit_score || 0),
        coBorrowerCreditScore: parseInt(loan.co_borrower_credit_score || 0),

        // Property information
        propertyType: loan.property_type,
        numberOfUnits: parseInt(loan.number_of_units || 1),
        occupancyStatus: loan.occupancy_status,
        propertyState: loan.property_state,
        msa: loan.msa,
        zipCode: loan.zip_code,

        // Loan characteristics
        firstTimeBuyer: loan.first_time_buyer,
        loanPurpose: loan.loan_purpose,
        mortgageInsurancePercentage: parseFloat(
          loan.mortgage_insurance_percentage || 0
        ),
        amortizationType: loan.amortization_type,
        prepaymentPenalty: loan.prepayment_penalty,
        interestOnlyLoan: loan.interest_only_loan,

        // Performance and servicing
        loanAge: parseInt(loan.loan_age || 0),
        remainingMonthsLegalMaturity: parseInt(
          loan.remaining_months_legal_maturity || 0
        ),
        remainingMonthsMaturity: parseInt(loan.remaining_months_maturity || 0),
        currentLoanDelinquencyStatus: parseInt(
          loan.current_loan_delinquency_status || 0
        ),
        loanPaymentHistory: loan.loan_payment_history,
        modificationFlag: loan.modification_flag,

        // Loss and recovery data
        foreclosureDate: loan.foreclosure_date,
        dispositionDate: loan.disposition_date,
        foreclosureCosts: parseFloat(loan.foreclosure_costs || 0),
        propertyPreservationCosts: parseFloat(
          loan.property_preservation_costs || 0
        ),
        netSalesProceeds: parseFloat(loan.net_sales_proceeds || 0),
        principalForgivenessAmount: parseFloat(
          loan.principal_forgiveness_amount || 0
        ),

        // Regulatory and compliance
        specialEligibilityProgram: loan.special_eligibility_program,
        highBalanceLoanIndicator: loan.high_balance_loan_indicator,
        relocationMortgageIndicator: loan.relocation_mortgage_indicator,
        dealName: loan.deal_name,
        interestBearingUPB: parseFloat(loan.interest_bearing_upb || 0)
      }

      await docClient
        .put({
          TableName: 'aidrrd-loans',
          Item: loanRecord
        })
        .promise()
    }

    console.log(
      'Portfolio data imported successfully with comprehensive GSE schema support'
    )
  } catch (err) {
    console.error('Error importing portfolio data:', err)
  }
}

// Run the import
importPortfolioData()
```

### Loan Data Import Script

Create `scripts/data-import/loan-data.js`:

```javascript
const AWS = require('aws-sdk')

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1' // Change to your region
})

const docClient = new AWS.DynamoDB.DocumentClient()

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
  }
  // Add more loan data here...
]

// Import loan data
const importLoanData = async () => {
  console.log(`Importing ${loanData.length} loans...`)

  for (const loan of loanData) {
    const params = {
      TableName: 'aidrrd-loans',
      Item: loan
    }

    try {
      await docClient.put(params).promise()
      console.log(`Imported loan ${loan.id}`)
    } catch (err) {
      console.error(`Error importing loan ${loan.id}:`, err)
    }
  }

  console.log('Loan data import completed')
}

// Run the import
importLoanData()
```

### Weather Data Import Script

Create `scripts/data-import/weather-data.js`:

```javascript
const AWS = require('aws-sdk')

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1' // Change to your region
})

const docClient = new AWS.DynamoDB.DocumentClient()

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
    weather: {
      main: 'Thunderstorm',
      description: 'thunderstorm with heavy rain',
      icon: '11d'
    },
    main: { temp: 30, humidity: 80 },
    wind: { speed: 20, deg: 220 },
    rain: { '1h': 30 },
    alerts: [
      {
        event: 'Severe Thunderstorm',
        description: 'Severe thunderstorm warning in effect'
      }
    ]
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
]

// Import weather data
const importWeatherData = async () => {
  console.log(`Importing weather data for ${weatherData.length} regions...`)

  for (const data of weatherData) {
    const params = {
      TableName: 'aidrrd-weather',
      Item: data
    }

    try {
      await docClient.put(params).promise()
      console.log(`Imported weather data for ${data.region}`)
    } catch (err) {
      console.error(`Error importing weather data for ${data.region}:`, err)
    }
  }

  console.log('Weather data import completed')
}

// Run the import
importWeatherData()
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
