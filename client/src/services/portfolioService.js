// Mock portfolio data service

// Sample mortgage portfolio data
export const getMockPortfolioData = () => {
  return {
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
};

// Sample loan data with more detailed information
export const getMockLoanData = () => {
  return [
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
    { 
      id: 'L003', 
      address: '789 Collins Ave, Miami, FL', 
      value: 275000, 
      balance: 178750,
      ltv: 0.65, 
      risk: 'low',
      lat: 25.7741, 
      lng: -80.1936,
      region: 'Miami',
      yearBuilt: 2015,
      loanType: '30-year fixed',
      interestRate: 3.5,
      monthlyPayment: 800,
      insuranceCoverage: 250000
    },
    
    // Houston properties
    { 
      id: 'L004', 
      address: '321 Main St, Houston, TX', 
      value: 380000, 
      balance: 285000,
      ltv: 0.75, 
      risk: 'high',
      lat: 29.7604, 
      lng: -95.3698,
      region: 'Houston',
      yearBuilt: 2000,
      loanType: '30-year fixed',
      interestRate: 4.5,
      monthlyPayment: 1425,
      insuranceCoverage: 350000
    },
    { 
      id: 'L005', 
      address: '654 Travis St, Houston, TX', 
      value: 290000, 
      balance: 203000,
      ltv: 0.70, 
      risk: 'medium',
      lat: 29.7633, 
      lng: -95.3633,
      region: 'Houston',
      yearBuilt: 2008,
      loanType: '30-year fixed',
      interestRate: 4.0,
      monthlyPayment: 970,
      insuranceCoverage: 275000
    },
    
    // New York properties
    { 
      id: 'L006', 
      address: '876 Broadway, New York, NY', 
      value: 920000, 
      balance: 717600,
      ltv: 0.78, 
      risk: 'medium',
      lat: 40.7128, 
      lng: -74.0060,
      region: 'NewYork',
      yearBuilt: 1985,
      loanType: '30-year fixed',
      interestRate: 3.9,
      monthlyPayment: 3385,
      insuranceCoverage: 900000
    },
    
    // San Francisco properties
    { 
      id: 'L007', 
      address: '987 Market St, San Francisco, CA', 
      value: 850000, 
      balance: 680000,
      ltv: 0.80, 
      risk: 'medium',
      lat: 37.7749, 
      lng: -122.4194,
      region: 'SanFrancisco',
      yearBuilt: 1995,
      loanType: '30-year fixed',
      interestRate: 3.7,
      monthlyPayment: 3130,
      insuranceCoverage: 800000
    },
    
    // New Orleans properties
    { 
      id: 'L008', 
      address: '234 Canal St, New Orleans, LA', 
      value: 310000, 
      balance: 223200,
      ltv: 0.72, 
      risk: 'high',
      lat: 29.9511, 
      lng: -90.0715,
      region: 'NewOrleans',
      yearBuilt: 2002,
      loanType: '30-year fixed',
      interestRate: 4.3,
      monthlyPayment: 1105,
      insuranceCoverage: 300000
    }
  ];
};

// Get loans by region
export const getLoansByRegion = (region) => {
  const allLoans = getMockLoanData();
  return allLoans.filter(loan => loan.region === region);
};

// Mock loan plans for current year
export const getCurrentYearLoanPlans = () => {
  return [
    {
      id: 'PLAN-2024-01',
      name: '30-Year Fixed Rate',
      interestRate: 6.5,
      description: 'Standard 30-year fixed rate mortgage',
      minimumDownPayment: 0.03,
      points: 0,
      fees: 1200,
      eligibility: 'Credit score 620+',
      riskLevel: 'low'
    },
    {
      id: 'PLAN-2024-02',
      name: '15-Year Fixed Rate',
      interestRate: 5.75,
      description: 'Lower rate 15-year fixed mortgage',
      minimumDownPayment: 0.05,
      points: 0,
      fees: 1100,
      eligibility: 'Credit score 640+',
      riskLevel: 'low'
    },
    {
      id: 'PLAN-2024-03',
      name: '5/1 ARM',
      interestRate: 5.25,
      description: '5-year fixed rate, then adjustable annually',
      minimumDownPayment: 0.05,
      points: 0.5,
      fees: 1300,
      eligibility: 'Credit score 660+',
      riskLevel: 'medium'
    },
    {
      id: 'PLAN-2024-04',
      name: 'FHA Loan',
      interestRate: 6.25,
      description: 'Government-backed loan with lower down payment',
      minimumDownPayment: 0.035,
      points: 0,
      fees: 1500,
      eligibility: 'Credit score 580+',
      riskLevel: 'medium'
    },
    {
      id: 'PLAN-2024-05',
      name: 'VA Loan',
      interestRate: 6.0,
      description: 'For veterans and service members',
      minimumDownPayment: 0,
      points: 0,
      fees: 1800,
      eligibility: 'Eligible veterans and service members',
      riskLevel: 'low'
    },
    {
      id: 'PLAN-2024-06',
      name: 'Jumbo Loan',
      interestRate: 6.75,
      description: 'For high-value properties exceeding conforming limits',
      minimumDownPayment: 0.10,
      points: 0.5,
      fees: 2500,
      eligibility: 'Credit score 700+',
      riskLevel: 'medium'
    },
    {
      id: 'PLAN-2024-07',
      name: 'Climate-Resilient Property Loan',
      interestRate: 5.9,
      description: 'Special rates for properties with climate resilience features',
      minimumDownPayment: 0.05,
      points: 0,
      fees: 1400,
      eligibility: 'Property must meet climate resilience standards',
      riskLevel: 'low'
    }
  ];
};