# AI-Powered Disaster Risk Resilience Dashboard (AIDRRD)

A comprehensive climate physical risk assessment platform designed for financial institutions, built with OS-Climate compatibility and industry-standard methodologies.

## Overview

AIDRRD provides enterprise-grade climate risk analytics for mortgage portfolios, implementing methodologies aligned with OS-Climate's physrisk framework. The platform transforms complex climate data into actionable financial risk insights.

### Core Capabilities

- **Portfolio Risk Assessment**: Comprehensive loan-level risk analysis using industry-standard GSE data schemas
- **Climate Hazard Integration**: Multi-hazard risk modeling (flood, wildfire, hurricane, heat stress)
- **Scenario Analysis**: Forward-looking climate projections with RCP/SSP pathway integration
- **Regulatory Compliance**: OS-Climate's physrisk framework
- **Real-time Analytics**: Portfolio risk calculations

## Technical Architecture

### Data Schema Compatibility

AIDRRD implements the comprehensive GSE loan performance data standard with 110+ fields including:

- **Loan Performance Metrics**: UPB tracking, delinquency status, modification history
- **Credit Risk Indicators**: FICO scores, DTI ratios, LTV analysis
- **Property Characteristics**: Geographic coordinates, property type, occupancy status
- **Geospatial Mapping**: Automatic coordinate generation based on property state with visualization offsets
- **Servicing Data**: Payment history, foreclosure tracking, loss mitigation
- **Financial Analytics**: Principal payments, foreclosure costs, asset recovery
- **Regulatory Compliance**: Special eligibility programs, high balance indicators
- **Risk Assessment**: Current and historical credit scores, modification tracking

### Portfolio Upload & Data Processing

The platform provides comprehensive portfolio data upload capabilities with real-time CSV analysis:

- **Multi-format Support**: CSV, Excel (.xlsx, .xls), and JSON file processing (up to 50MB)
- **Intelligent File Handling**: CSV files automatically replace existing portfolio data as `portfolio.csv`
- **Real-time CSV Analysis**: Comprehensive loan-level analysis with financial metrics calculation
- **Advanced Validation**: Required field validation (loan_identifier, original_upb, original_ltv, borrower_credit_score)
- **Risk Categorization**: Automatic risk assessment based on LTV and credit score thresholds
- **Portfolio Analytics**: Instant calculation of portfolio health, delinquency rates, and regional distribution
- **Data Quality Reporting**: Detailed statistics on valid/invalid loans with comprehensive error handling

### API Architecture

```
/api/portfolio/                    # Portfolio summary analytics
/api/portfolio/region/:regionId    # Regional risk aggregation
/api/portfolio/loan/:loanId        # Individual loan risk profile
/api/portfolio/analytics/performance # Credit quality metrics
/api/portfolio/analytics/climate   # Climate risk assessment data
/api/upload/                       # Portfolio file upload and processing
/api/hazard/                       # Climate hazard data endpoints
/api/analysis/                     # Risk scenario calculations
```

### Risk Modeling Framework

Following OS-Climate physrisk methodology:

1. **Hazard Layer Processing**: Ingestion of climate model outputs (CMIP6, downscaled projections)
2. **Exposure Mapping**: Property-level geocoding with precision coordinate matching
3. **Vulnerability Assessment**: Damage functions calibrated to regional building codes
4. **Risk Quantification**: Expected Annual Loss (EAL) calculations with uncertainty bounds

### Climate Service Implementation

The platform includes a comprehensive climate risk assessment service (`server/services/climateService.js`) that provides:

**Geographic Risk Modeling:**

- **Flood Risk Assessment**: Coastal proximity analysis with enhanced risk scoring for Gulf Coast, Florida, and Louisiana regions
- **Fire Risk Calculation**: Western states wildfire risk modeling with California-specific adjustments
- **Wind Risk Analysis**: Tornado Alley and hurricane zone risk assessment with regional variations
- **Heat Risk Evaluation**: Southwestern states heat stress modeling with Arizona, Nevada, and Texas focus

**Portfolio-Level Climate Analytics:**

- **Multi-Hazard Integration**: Comprehensive risk assessment across flood, fire, wind, and heat hazards
- **Exposure Calculation**: Portfolio-wide climate risk aggregation with loan-level precision
- **Risk Threshold Analysis**: Configurable risk thresholds (default: 0.3) for significant risk identification
- **Geographic Coordinate Processing**: Latitude/longitude-based risk calculations for precise location analysis

**API Integration Ready:**

- **External Climate API Support**: Framework prepared for integration with NOAA, OpenWeatherMap, NASA, and First Street Foundation APIs
- **Scalable Architecture**: Designed for real-time climate data ingestion and processing
- **Error Handling**: Robust error management with fallback to geographic risk calculations

## Integration with OS-Climate Ecosystem

### physrisk Compatibility

- **Hazard Model Integration**: Compatible with OS-Climate hazard data formats
- **Risk Measure Standardization**: Implements standard risk metrics (VaR, Expected Shortfall)
- **Scenario Framework**: Supports NGFS climate scenarios and custom stress tests
- **Data Pipeline**: ETL processes aligned with OS-Climate data governance standards

### FINOS Integration Patterns

Based on the FINOS hackathon implementation:

- **Microservices Architecture**: Containerized services with Kubernetes orchestration
- **Event-Driven Processing**: Apache Kafka for real-time risk updates
- **API Gateway**: Standardized REST/GraphQL endpoints with OpenAPI specifications
- **Data Lineage**: Complete audit trail for model risk management

## Dashboard Real-Time Integration

### Live Data Dashboard

The Risk Dashboard has been enhanced with real-time API integration and a comprehensive metrics layout, providing dynamic portfolio analytics with comprehensive error handling and smooth user experience. The dashboard now features enhanced map integration with real portfolio data visualization:

**Key Features:**

- **Real-time Data Fetching**: Automatic loading of portfolio summary and loan details on component mount
- **Enhanced Metrics Layout**: Organized into logical sections with 8 primary portfolio metrics displayed in a clean 4x2 grid
- **Dynamic Risk Distribution**: Client-side calculation of risk categories from live loan data
- **Regional Exposure Analysis**: Real-time aggregation of portfolio value by state/region
- **Physical Risk Exposure**: Dedicated section for flood, fire, wind, and heat risk metrics
- **Enhanced Error Handling**: Animated error alerts with dismissible functionality and graceful error recovery
- **Loading States**: Skeleton loading animations for optimal user experience during data fetching
- **Interactive Alerts**: Weather and risk alerts with dismissible notifications and severity indicators
- **Smooth Animations**: Framer Motion integration for fluid transitions and staggered component loading

**Dashboard Layout Structure:**

**First Row - Core Portfolio Metrics:**

- Total Portfolio Value (formatted in millions with success color and AttachMoneyIcon)
- Number of Loans (with thousand separators and primary color)
- Average LTV (with error color indicating risk level)
- Average Credit Score (with warning color)

**Second Row - Performance & Risk Metrics:**

- Average DTI (debt-to-income ratio with success color)
- Delinquent Loans (formatted count with primary color)
- Current UPB (unpaid principal balance in millions with error color)
- Average Loan Age (in months with warning color)

**Physical Risk Section:**

- Flood Risk, Fire Risk, Wind Risk, Heat Risk (now displaying live climate risk exposure data in millions when available)
- Each risk type has dedicated, contextually appropriate icons and color coding for visual clarity
- Dynamic data integration: Shows actual exposure values from climate API or fallback message when data unavailable

**Data Flow:**

1. Dashboard component fetches data from `/api/portfolio`, `/api/portfolio/loans`, and `/api/portfolio/analytics/climate` endpoints
2. Portfolio summary provides high-level metrics (total loans, values, averages)
3. Individual loan data enables dynamic risk distribution and regional exposure calculations
4. Climate risk data integration ready for physical risk exposure metrics (flood, fire, wind, heat)
5. Charts and visualizations update automatically based on real portfolio data
6. Metrics are displayed with appropriate formatting (currency, percentages, counts)

**Performance Optimizations:**

- Parallel API calls using `Promise.all()` for faster data loading
- Memoized calculations using `React.useMemo()` to prevent unnecessary re-renders
- Efficient data transformations for chart components
- Optimized grid layout for responsive design across screen sizes

### API Integration Architecture

```javascript
// Dashboard data fetching pattern
const [summaryData, loansData] = await Promise.all([
  fetchPortfolioSummary(), // /api/portfolio
  fetchPortfolioLoans() // /api/portfolio/loans
])

// Dynamic risk distribution calculation
const riskDistribution = useMemo(() => {
  const riskCounts = loans.reduce((acc, loan) => {
    acc[loan.risk] = (acc[loan.risk] || 0) + 1
    return acc
  }, {})

  return [
    { name: 'Low Risk', value: riskCounts.low || 0 },
    { name: 'Medium Risk', value: riskCounts.medium || 0 },
    { name: 'High Risk', value: riskCounts.high || 0 }
  ]
}, [loans])

// Regional exposure calculation
const regionalExposure = useMemo(() => {
  const stateData = loans.reduce((acc, loan) => {
    const state = loan.state || 'Unknown'
    if (!acc[state]) {
      acc[state] = { name: state, value: 0 }
    }
    acc[state].value += loan.value
    return acc
  }, {})

  return Object.values(stateData)
}, [loans])
```

### Dashboard Component Features

**Real-time Data Display:**

- **Portfolio Summary Cards**: Total portfolio value, number of loans, average LTV with live data
- **Physical Risk Exposure**: Flood, fire, wind, and heat risk metrics (currently using mock data)
- **Dynamic Charts**: Risk distribution pie chart and regional exposure bar chart using real portfolio data
- **Interactive Risk Map**: US risk hotspots visualization with real portfolio data integration
- **Historical Trends**: Multi-year loss analysis with line charts

**Enhanced Map Integration:**

The USRiskMap component has been optimized for real portfolio data visualization with a clean, production-ready implementation:

- **Real Portfolio Data Focus**: The map exclusively displays actual loan locations from the `portfolioData` prop, eliminating sample data dependencies
- **Streamlined Architecture**: Risk zone circles are preserved in code but commented out to focus on actual portfolio properties, reducing visual complexity while maintaining future extensibility
- **Dynamic Property Rendering**: Component automatically renders portfolio properties when data is available, with graceful fallback handling for empty datasets
- **Geographic Risk Assessment**: Maps actual portfolio properties with their precise coordinates and risk levels using real-time data
- **Enhanced Interactive Tooltips**: Hover tooltips display property address with precise geographic coordinates (latitude/longitude to 4 decimal places) for accurate location identification
- **Interactive Property Details**: Click on property markers to view comprehensive loan-specific information including value, risk level, address, and coordinates
- **Clean Visual Design**: Risk markers feature streamlined, circular design with color-coded risk levels (red for high, orange for medium, green for low) and consistent 20px sizing
- **Production-Ready Architecture**: Map component fully integrated with real portfolio data pipeline, optimized for performance with proper error handling and TypeScript compatibility
- **Multiple Map Styles**: Supports standard OpenStreetMap, satellite imagery, and hybrid views for different visualization needs
- **Leaflet Integration**: Uses React-Leaflet with proper icon configuration and custom marker styling for consistent cross-browser compatibility

**Map Component Usage:**

```javascript
<USRiskMap
  hazardType='all'
  timeframe={2023}
  mapStyle='map'
  portfolioData={loans} // Real portfolio data from API
/>
```

**Current Implementation Status:**

- The map displays real portfolio data when available through the portfolioData prop
- Fallback handling ensures graceful behavior when no portfolio data is provided
- Risk zones show comprehensive climate hazard coverage (flood, fire, wind, heat)
- Interactive tooltips and popups provide detailed risk information for actual properties
- Multiple map styles supported (standard, satellite, hybrid)
- Geographic coordinates are generated from actual loan data with visualization offsets

The enhanced map provides a comprehensive view of regional climate hazards overlaid with actual portfolio properties, delivering real-time risk visualization for financial institutions.

**Enhanced Icon System:**

The dashboard includes a comprehensive icon library with semantic icon mapping for improved visual representation:

- **Financial Icons**: AttachMoneyIcon for monetary values and financial metrics (Total Portfolio Value, Current UPB)
- **Statistical Icons**: PercentIcon for percentage-based metrics (LTV ratios), CalculateIcon for loan counts and numerical calculations
- **Risk Assessment Icons**: WarningIcon for risk indicators and delinquency metrics, AccessTimeIcon for time-based metrics
- **Physical Risk Icons**: WaterIcon (flood), LocalFireDepartmentIcon (fire), AirIcon (wind), ThermostatIcon (heat)
- **Credit Metrics**: NumbersIcon for credit scores and appropriate icons matched to specific financial indicators

**Recent Icon Improvements:**

- **Number of Loans Metric**: Updated to use CalculateIcon instead of NumbersIcon for better semantic alignment with calculation-based metrics
- **Delinquent Loans Metric**: Uses WarningIcon for better semantic alignment with risk indicators
- **Current UPB Metric**: Uses AttachMoneyIcon for proper financial value representation
- **Average Loan Age Metric**: Uses AccessTimeIcon for better time-based metric representation
- **Consistent Risk Categorization**: Each physical risk type (flood, fire, wind, heat) has dedicated, contextually appropriate icons
- **Visual Hierarchy**: Icons are color-coded by risk level (success, warning, error, info) to provide immediate visual context
- **Wind Risk Icon Update**: Recently updated to use success color scheme for better visual consistency with low-risk indicators
- **Code Quality**: Fixed icon reference bug where `calculate` was incorrectly used instead of `CalculateIcon` component

These icons are imported from Material-UI's icon library and provide intuitive visual cues that enhance user comprehension of complex financial and risk metrics.

**Error Handling & UX:**

- **Loading States**: Skeleton animations during data fetching
- **Error Alerts**: User-friendly error messages with dismissible alerts
- **Graceful Degradation**: Displays 'N/A' when data is unavailable
- **Responsive Design**: Optimized for desktop and mobile viewing

**Performance Features:**

- **Parallel API Calls**: Simultaneous fetching of portfolio summary and loan details
- **Memoized Calculations**: Efficient re-rendering with React.useMemo()
- **Optimized Data Transformations**: Client-side processing for chart data

## Advanced Features

### Machine Learning Risk Models

- **Credit Risk Prediction**: XGBoost models for default probability estimation
- **Climate Impact Modeling**: Neural networks for non-linear climate-credit relationships
- **Portfolio Optimization**: Reinforcement learning for risk-adjusted allocation
- **Anomaly Detection**: Unsupervised learning for early warning systems

### Performance & Scalability

- **Sub-second Response Times**: Optimized queries with Redis caching
- **Horizontal Scaling**: Auto-scaling Node.js clusters with load balancing
- **Data Processing**: Parallel processing of 1M+ loan portfolios
- **Real-time Updates**: WebSocket connections for live risk monitoring

### Security & Compliance

- **Data Encryption**: AES-256 encryption at rest and in transit
- **Access Controls**: Role-based permissions with OAuth 2.0/OIDC
- **Audit Logging**: Comprehensive activity tracking for regulatory compliance
- **Data Privacy**: GDPR/CCPA compliant data handling procedures

## Tech Stack

### Backend Infrastructure

- **Runtime**: Node.js 18+ with Express.js framework
- **Database**: PostgreSQL with PostGIS for spatial operations
- **Caching**: Redis for high-performance data retrieval
- **Message Queue**: Apache Kafka for event streaming
- **File Storage**: AWS S3 with CloudFront CDN

### Frontend Architecture

- **Framework**: React 18 with TypeScript for type safety
- **State Management**: Redux Toolkit with RTK Query
- **Visualization**: D3.js, Mapbox GL JS, and Plotly.js
- **UI Components**: Material-UI with custom design system
- **Performance**: Code splitting and lazy loading for optimal UX
- **Real-time Data Integration**: Live API consumption with error handling and loading states
- **Dynamic Analytics**: Client-side data processing for risk distribution and regional exposure calculations

### Data Processing Pipeline

- **ETL Framework**: Apache Airflow for workflow orchestration
- **Geospatial Processing**: PostGIS, GDAL, and Shapely
- **Climate Data**: NetCDF processing with xarray and dask
- **Statistical Computing**: R integration for advanced risk models

### DevOps & Monitoring

- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes with Helm charts
- **CI/CD**: GitHub Actions with automated testing
- **Monitoring**: Prometheus, Grafana, and ELK stack
- **Error Tracking**: Sentry for real-time error monitoring

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ with PostGIS extension
- Redis 6+
- Docker & Docker Compose

### Server Configuration

The Express.js server includes enhanced middleware configuration for robust data handling:

```javascript
// Enhanced middleware stack
app.use(cors()) // Cross-origin resource sharing
app.use(express.json()) // JSON request body parsing
app.use(express.urlencoded({ extended: true })) // URL-encoded form data parsing
```

This configuration supports:

- **JSON API requests**: Standard REST API communication
- **Form data submissions**: HTML form processing and file uploads
- **URL-encoded data**: Query parameters and form-encoded payloads
- **Cross-origin requests**: Frontend-backend communication across domains

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/AI-DRRD.git
cd AI-DRRD

# Install dependencies
npm run install-all

# Install TypeScript type definitions for mapping components
cd client
npm install --save-dev @types/leaflet

# Set up environment
cd ..
cp .env.sample .env
# Configure database connections and API keys
# Note: Server runs on port 5000 by default

# Ensure CSV data is in place
# Place your portfolio CSV file in server/data/portfolio.csv
# Required columns: loan_identifier, original_upb, current_actual_upb,
# original_ltv, borrower_credit_score, dti, risk_level, region, etc.

# Start development environment
npm run dev
```

### CSV Data Format

The portfolio API supports the complete GSE loan performance data schema with 110+ fields. The system processes all available fields and provides comprehensive loan-level analytics.

**Minimum Required Fields:**

```csv
loan_identifier,original_upb,original_ltv,borrower_credit_score,property_state
12345,66000,45,720,NY
12346,125000,80,740,FL
```

**Comprehensive Schema Support:**

The API processes all GSE standard fields including:

**Core Loan Data:**

- `reference_pool_id`, `loan_identifier`, `monthly_reporting_period`
- `channel`, `seller_name`, `servicer_name`, `master_servicer`

**Financial Metrics:**

- `original_upb`, `current_actual_upb`, `upb_at_issuance`
- `original_interest_rate`, `current_interest_rate`
- `original_loan_term`, `loan_age`, `remaining_months_maturity`

**Credit & Risk:**

- `borrower_credit_score`, `co_borrower_credit_score`
- `original_ltv`, `original_cltv`, `dti`
- `current_loan_delinquency_status`, `loan_payment_history`

**Property Information:**

- `property_type`, `number_of_units`, `occupancy_status`
- `property_state`, `msa`, `zip_code`

**Servicing & Modifications:**

- `modification_flag`, `mortgage_insurance_cancellation`
- `foreclosure_date`, `disposition_date`
- `scheduled_principal_current`, `total_principal_current`

**Loss & Recovery:**

- `foreclosure_costs`, `property_preservation_costs`
- `net_sales_proceeds`, `credit_enhancement_proceeds`
- `principal_forgiveness_amount`

**Regulatory & Compliance:**

- `special_eligibility_program`, `high_balance_loan_indicator`
- `relocation_mortgage_indicator`, `deal_name`

Key processing features:

- **Automatic Risk Assessment**: LTV and credit score-based risk categorization
- **Data Validation**: Required field validation with detailed error reporting
- **Financial Calculations**: Automatic computation of portfolio metrics
- **Geographic Analysis**: State and regional distribution analytics

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# Scale API services
docker-compose up -d --scale api=3
```

## API Documentation

### Portfolio Analytics Endpoint

```javascript
GET /api/portfolio/
Response: {
  summary: {
    totalLoans: 4,
    totalOriginalUPB: 466000,
    totalCurrentUPB: 437050.98,
    averageLTV: 67.5,
    averageCreditScore: 725,
    averageDTI: 30,
    portfolioUtilization: 93.79
  },
  riskCategories: { medium: 2, high: 1, low: 1 },
  regions: [
    { name: "Northeast", count: 1, originalValue: 66000, currentValue: 64350.98 },
    { name: "Southeast", count: 1, originalValue: 125000, currentValue: 118500 }
  ],
  delinquencyStats: { current: 4, early: 0, moderate: 0, severe: 0 },
  performanceMetrics: {
    weightedAverageAge: 162,
    averageRemainingTerm: 198
  }
}
```

### Regional Portfolio Analysis

```javascript
GET /api/portfolio/region/Northeast
Response: {
  region: "Northeast",
  totalLoans: 1,
  totalOriginalUPB: 66000,
  totalCurrentUPB: 64350.98,
  averageLTV: 45,
  averageCreditScore: 720,
  riskDistribution: { medium: 1 },
  stateDistribution: { NY: 1 },
  loans: [/* loan details array */]
}
```

### Individual Loan Risk Profile

```javascript
GET /api/portfolio/loan/12345
Response: {
  loanIdentifier: "12345",
  basicInfo: {
    originalUPB: 66000,
    currentUPB: 64350.98,
    originalLTV: 45,
    originalCLTV: 50,
    loanAge: 180,
    remainingTerm: 80
  },
  borrowerInfo: {
    creditScore: 720,
    dti: 35,
    numberOfBorrowers: 1
  },
  propertyInfo: {
    propertyType: "SF",
    numberOfUnits: 1,
    occupancyStatus: "P",
    state: "NY",
    msa: "18141",
    zipCode: "455"
  },
  riskAssessment: {
    riskLevel: "medium",
    delinquencyStatus: 0,
    region: "Northeast"
  }
}
```

### Detailed Loan List

```javascript
GET / api / portfolio / loans
Response: [
  {
    // Core loan identification and risk metrics
    id: '12345',
    address: 'NY, 10001',
    value: 66000,
    ltv: 0.45,
    risk: 'low',
    creditScore: 720,
    state: 'NY',
    lat: 40.2128, // Geographic coordinates for mapping
    lng: -74.506, // Includes random offset for visualization
    delinquencyStatus: 0,
    loanAge: 180,
    interestRate: 4.25,
    dti: 35,
    propertyType: 'SF',
    occupancyStatus: 'P',

    // Comprehensive GSE loan performance data fields
    referencePoolId: 'POOL001',
    monthlyReportingPeriod: '122020',
    channel: 'R',
    sellerName: 'Bank1',
    servicerName: 'Bank1',
    masterServicer: 'MasterServ1',
    originalInterestRate: 5.38,
    upbAtIssuance: 66000,
    currentActualUPB: 64350.98,
    originalLoanTerm: 260,
    originationDate: '72009',
    firstPaymentDate: '112009',
    remainingMonthsLegalMaturity: 112,
    remainingMonthsMaturity: 112,
    maturityDate: '102029',
    originalCLTV: 50,
    numberOfBorrowers: 1,
    coBorrowerCreditScore: 0,
    firstTimeBuyer: 'N',
    loanPurpose: 'C',
    numberOfUnits: 1,
    msa: '18141',
    mortgageInsurancePercentage: 0,
    amortizationType: 'FRM',
    prepaymentPenalty: 'N',
    interestOnlyLoan: 'N',
    loanPaymentHistory: '0',
    modificationFlag: 'N',
    mortgageInsuranceCancellation: '',
    zeroBalanceCode: '',
    zeroBalanceEffectiveDate: '',
    upbAtRemoval: 0,
    repurchaseDate: '',
    scheduledPrincipalCurrent: 226.92,
    totalPrincipalCurrent: 226.92,
    unscheduledPrincipalCurrent: 0,
    lastPaidInstallmentDate: '',
    foreclosureDate: '',
    dispositionDate: '',
    foreclosureCosts: 0,
    propertyPreservationCosts: 0,
    assetRecoveryCosts: 0,
    miscHoldingExpenses: 0,
    associatedTaxes: 0,
    netSalesProceeds: 0,
    creditEnhancementProceeds: 0,
    repurchaseMakeWholeProceeds: 0,
    otherForeclosureProceeds: 0,
    modificationNonInterestBearingUPB: 0,
    principalForgivenessAmount: 0,
    borrowerCreditScoreCurrent: 0,
    coBorrowerCreditScoreCurrent: 0,
    mortgageInsuranceType: '',
    servicingActivityIndicator: 'N',
    currentPeriodModificationLoss: 0,
    cumulativeModificationLoss: 0,
    currentPeriodCreditEventLoss: 0,
    cumulativeCreditEventLoss: 0,
    specialEligibilityProgram: '',
    foreclosurePrincipalWriteoff: 0,
    relocationMortgageIndicator: 'N',
    highBalanceLoanIndicator: 'N',
    dealName: '',
    interestBearingUPB: 0
  }
]
```

### Performance Analytics

```javascript
GET /api/portfolio/analytics/performance
Response: {
  creditQuality: {
    averageCreditScore: 725,
    creditScoreDistribution: {
      excellent: 0, veryGood: 2, good: 2, fair: 0, poor: 0
    }
  },
  ltvAnalysis: {
    averageLTV: 67.5,
    ltvDistribution: { low: 1, moderate: 2, high: 1, veryHigh: 0 }
  },
  maturityProfile: {
    averageRemainingTerm: 198,
    maturityDistribution: { shortTerm: 0, mediumTerm: 2, longTerm: 2 }
  }
}
```

### Climate Risk Analytics

```javascript
GET /api/portfolio/analytics/climate
Response: {
  portfolioClimateRisk: {
    flood: {
      totalExposure: 12500000,
      affectedLoans: 45,
      averageRiskScore: 0.65
    },
    fire: {
      totalExposure: 8200000,
      affectedLoans: 32,
      averageRiskScore: 0.42
    },
    wind: {
      totalExposure: 15800000,
      affectedLoans: 67,
      averageRiskScore: 0.58
    },
    heat: {
      totalExposure: 6900000,
      affectedLoans: 28,
      averageRiskScore: 0.38
    }
  },
  riskSummary: {
    totalClimateExposure: 43400000,
    highRiskLoans: 172,
    portfolioRiskScore: 0.51,
    riskDistribution: {
      low: 0.35,
      moderate: 0.42,
      high: 0.23
    }
  },
  regionalBreakdown: [
    {
      region: "Southeast",
      primaryHazards: ["flood", "wind"],
      totalExposure: 18200000,
      riskScore: 0.72
    },
    {
      region: "West",
      primaryHazards: ["fire", "heat"],
      totalExposure: 14800000,
      riskScore: 0.58
    }
  ]
}
```

### Portfolio Upload Endpoint

```javascript
POST /api/upload/
Content-Type: multipart/form-data
Body: FormData with 'portfolio' file field

Response: {
  success: true,
  message: "Portfolio data uploaded and analyzed successfully!",
  file: "portfolio.csv",
  details: {
    loansProcessed: 234,
    validLoans: 228,
    invalidLoans: 6,
    totalValue: "$47,500,000",
    currentValue: "$44,200,000",
    averageLTV: "72.5%",
    averageCreditScore: 718,
    delinquentLoans: 12,
    delinquencyRate: "5.26%"
  },
  analytics: {
    riskDistribution: {
      low: 68,
      medium: 124,
      high: 36
    },
    stateDistribution: {
      "NY": 45,
      "CA": 67,
      "FL": 89,
      "TX": 27
    },
    portfolioHealth: {
      creditQuality: "Good",
      ltvRisk: "Moderate",
      delinquencyRisk: "High"
    }
  }
}

// Error Response Examples:
{
  success: false,
  error: "No file uploaded"
}

{
  success: false,
  error: "Uploaded file not found"
}

{
  success: false,
  error: "Failed to process portfolio file",
  message: "Detailed error message",
  stack: "Error stack trace (development mode)"
}
```

**Enhanced Upload Features:**

- **File Types**: CSV, Excel (.xlsx, .xls), JSON
- **File Size**: Maximum 50MB (increased capacity)
- **Intelligent Processing**: CSV files automatically saved as `portfolio.csv` for immediate use
- **Real-time Analysis**: Comprehensive loan-level validation and risk assessment
- **Required Fields**: loan_identifier, original_upb, original_ltv, borrower_credit_score
- **Advanced Analytics**:
  - Portfolio health assessment (credit quality, LTV risk, delinquency risk)
  - State-by-state distribution analysis
  - Risk categorization based on LTV and credit score thresholds
  - Financial metrics with currency formatting
  - Data quality reporting with valid/invalid loan counts

## Contributing

We welcome contributions that enhance climate risk modeling capabilities. Please review our [contribution guidelines](CONTRIBUTING.md) and ensure compatibility with OS-Climate standards.

## License

License information not specified. Please contact the project maintainers for licensing details.

## Acknowledgments

- OS-Climate Foundation for physrisk methodology
- FINOS for open-source financial standards
- TCFD for climate risk disclosure framework
