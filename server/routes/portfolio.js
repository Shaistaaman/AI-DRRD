const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const router = express.Router();

// Helper function to read portfolio CSV data
const readPortfolioData = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    const csvPath = path.join(__dirname, '../data/portfolio.csv');

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Get all portfolio data with enhanced analytics
router.get('/', async (req, res) => {
  try {
    const portfolioData = await readPortfolioData();

    // Calculate comprehensive portfolio metrics
    const totalLoans = portfolioData.length;
    const totalOriginalUPB = portfolioData.reduce((sum, loan) => sum + parseFloat(loan.original_upb || 0), 0);
    const totalCurrentUPB = portfolioData.reduce((sum, loan) => sum + parseFloat(loan.current_actual_upb || 0), 0);
    const averageLTV = portfolioData.reduce((sum, loan) => sum + parseFloat(loan.original_ltv || 0), 0) / totalLoans;
    const averageCreditScore = portfolioData.reduce((sum, loan) => sum + parseFloat(loan.borrower_credit_score || 0), 0) / totalLoans;
    const averageDTI = portfolioData.reduce((sum, loan) => sum + parseFloat(loan.dti || 0), 0) / totalLoans;

    // Risk categorization
    const riskCategories = portfolioData.reduce((acc, loan) => {
      const risk = loan.risk_level || 'unknown';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {});

    // Regional analysis
    const regions = portfolioData.reduce((acc, loan) => {
      const region = loan.region || 'Unknown';
      if (!acc[region]) {
        acc[region] = { name: region, count: 0, originalValue: 0, currentValue: 0 };
      }
      acc[region].count++;
      acc[region].originalValue += parseFloat(loan.original_upb || 0);
      acc[region].currentValue += parseFloat(loan.current_actual_upb || 0);
      return acc;
    }, {});

    // Delinquency analysis
    const delinquencyStats = portfolioData.reduce((acc, loan) => {
      const status = parseInt(loan.current_loan_delinquency_status || 0);
      if (status === 0) acc.current++;
      else if (status <= 30) acc.early++;
      else if (status <= 90) acc.moderate++;
      else acc.severe++;
      return acc;
    }, { current: 0, early: 0, moderate: 0, severe: 0 });

    const response = {
      summary: {
        totalLoans,
        totalOriginalUPB,
        totalCurrentUPB,
        averageLTV: Math.round(averageLTV * 100) / 100,
        averageCreditScore: Math.round(averageCreditScore),
        averageDTI: Math.round(averageDTI * 100) / 100,
        portfolioUtilization: Math.round((totalCurrentUPB / totalOriginalUPB) * 10000) / 100
      },
      riskCategories,
      regions: Object.values(regions),
      delinquencyStats,
      performanceMetrics: {
        weightedAverageAge: portfolioData.reduce((sum, loan) => sum + parseFloat(loan.loan_age || 0), 0) / totalLoans,
        averageRemainingTerm: portfolioData.reduce((sum, loan) => sum + (parseFloat(loan.original_loan_term || 0) - parseFloat(loan.loan_age || 0)), 0) / totalLoans
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error reading portfolio data:', error);
    res.status(500).json({ error: 'Failed to load portfolio data' });
  }
});

// Get portfolio data by region
router.get('/region/:regionId', async (req, res) => {
  try {
    const portfolioData = await readPortfolioData();
    const regionLoans = portfolioData.filter(loan =>
      loan.region && loan.region.toLowerCase() === req.params.regionId.toLowerCase()
    );

    if (regionLoans.length === 0) {
      return res.status(404).json({ error: 'Region not found' });
    }

    const regionMetrics = {
      region: req.params.regionId,
      totalLoans: regionLoans.length,
      totalOriginalUPB: regionLoans.reduce((sum, loan) => sum + parseFloat(loan.original_upb || 0), 0),
      totalCurrentUPB: regionLoans.reduce((sum, loan) => sum + parseFloat(loan.current_actual_upb || 0), 0),
      averageLTV: regionLoans.reduce((sum, loan) => sum + parseFloat(loan.original_ltv || 0), 0) / regionLoans.length,
      averageCreditScore: regionLoans.reduce((sum, loan) => sum + parseFloat(loan.borrower_credit_score || 0), 0) / regionLoans.length,
      riskDistribution: regionLoans.reduce((acc, loan) => {
        const risk = loan.risk_level || 'unknown';
        acc[risk] = (acc[risk] || 0) + 1;
        return acc;
      }, {}),
      stateDistribution: regionLoans.reduce((acc, loan) => {
        const state = loan.property_state || 'Unknown';
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      ...regionMetrics,
      loans: regionLoans.slice(0, 100) // Limit to first 100 for performance
    });
  } catch (error) {
    console.error('Error fetching region data:', error);
    res.status(500).json({ error: 'Failed to load region data' });
  }
});

// Get individual loan details
router.get('/loan/:loanId', async (req, res) => {
  try {
    const portfolioData = await readPortfolioData();
    const loan = portfolioData.find(l => l.loan_identifier === req.params.loanId);

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Enhanced loan details with risk assessment
    const loanDetails = {
      loanIdentifier: loan.loan_identifier,
      basicInfo: {
        originalUPB: parseFloat(loan.original_upb || 0),
        currentUPB: parseFloat(loan.current_actual_upb || 0),
        originalLTV: parseFloat(loan.original_ltv || 0),
        originalCLTV: parseFloat(loan.original_cltv || 0),
        loanAge: parseInt(loan.loan_age || 0),
        remainingTerm: parseInt(loan.original_loan_term || 0) - parseInt(loan.loan_age || 0)
      },
      borrowerInfo: {
        creditScore: parseInt(loan.borrower_credit_score || 0),
        dti: parseFloat(loan.dti || 0),
        numberOfBorrowers: parseInt(loan.number_of_borrowers || 1)
      },
      propertyInfo: {
        propertyType: loan.property_type,
        numberOfUnits: parseInt(loan.number_of_units || 1),
        occupancyStatus: loan.occupancy_status,
        state: loan.property_state,
        msa: loan.msa,
        zipCode: loan.zip_code
      },
      loanTerms: {
        originalInterestRate: parseFloat(loan.original_interest_rate || 0),
        currentInterestRate: parseFloat(loan.current_interest_rate || 0),
        originalTerm: parseInt(loan.original_loan_term || 0),
        originationDate: loan.origination_date,
        maturityDate: loan.maturity_date
      },
      riskAssessment: {
        riskLevel: loan.risk_level,
        delinquencyStatus: parseInt(loan.current_loan_delinquency_status || 0),
        region: loan.region
      },
      servicingInfo: {
        sellerName: loan.seller_name,
        servicerName: loan.servicer_name,
        monthlyReportingPeriod: loan.monthly_reporting_period
      }
    };

    res.json(loanDetails);
  } catch (error) {
    console.error('Error fetching loan details:', error);
    res.status(500).json({ error: 'Failed to load loan details' });
  }
});

// Get detailed loan list for PortfolioAnalysis page
router.get('/loans', async (req, res) => {
  try {
    const portfolioData = await readPortfolioData();

    // Transform data for frontend consumption
    const loans = portfolioData.map(loan => {
      const ltv = parseFloat(loan.original_ltv || 0) / 100;
      const creditScore = parseInt(loan.borrower_credit_score || 0);
      const upb = parseFloat(loan.original_upb || 0);

      // Determine risk level based on LTV and credit score
      let riskLevel = 'low';
      if (ltv > 0.85 || creditScore < 620) {
        riskLevel = 'high';
      } else if (ltv > 0.75 || creditScore < 680) {
        riskLevel = 'medium';
      }

      // Add approximate coordinates based on state (for mapping)
      const stateCoordinates = {
        'NY': { lat: 40.7128, lng: -74.0060 },
        'CA': { lat: 37.7749, lng: -122.4194 },
        'TX': { lat: 29.7604, lng: -95.3698 },
        'FL': { lat: 25.7617, lng: -80.1918 },
        'IL': { lat: 41.8781, lng: -87.6298 },
        'WA': { lat: 47.6062, lng: -122.3321 },
        'GA': { lat: 33.7490, lng: -84.3880 },
        'AZ': { lat: 33.4484, lng: -112.0740 },
        'MA': { lat: 42.3601, lng: -71.0589 },
        'NC': { lat: 35.7796, lng: -78.6382 }
      };

      const coords = stateCoordinates[loan.property_state] || { lat: 39.8283, lng: -98.5795 };

      return {
        id: loan.loan_identifier,
        address: `${loan.property_state || 'Unknown'}, ${loan.zip_code || ''}`,
        value: upb,
        ltv: ltv,
        risk: riskLevel,
        creditScore: creditScore,
        state: loan.property_state,
        lat: coords.lat + (Math.random() - 0.5) * 2, // Add small random offset for visualization
        lng: coords.lng + (Math.random() - 0.5) * 2,
        delinquencyStatus: parseInt(loan.current_loan_delinquency_status || 0),
        loanAge: parseInt(loan.loan_age || 0),
        interestRate: parseFloat(loan.current_interest_rate || 0),
        dti: parseFloat(loan.dti || 0),
        propertyType: loan.property_type,
        occupancyStatus: loan.occupancy_status,
        // Additional comprehensive fields
        referencePoolId: loan.reference_pool_id,
        monthlyReportingPeriod: loan.monthly_reporting_period,
        channel: loan.channel,
        sellerName: loan.seller_name,
        servicerName: loan.servicer_name,
        masterServicer: loan.master_servicer,
        originalInterestRate: parseFloat(loan.original_interest_rate || 0),
        upbAtIssuance: parseFloat(loan.upb_at_issuance || 0),
        currentActualUPB: parseFloat(loan.current_actual_upb || 0),
        originalLoanTerm: parseInt(loan.original_loan_term || 0),
        originationDate: loan.origination_date,
        firstPaymentDate: loan.first_payment_date,
        remainingMonthsLegalMaturity: parseInt(loan.remaining_months_legal_maturity || 0),
        remainingMonthsMaturity: parseInt(loan.remaining_months_maturity || 0),
        maturityDate: loan.maturity_date,
        originalCLTV: parseFloat(loan.original_cltv || 0),
        numberOfBorrowers: parseInt(loan.number_of_borrowers || 1),
        coBorrowerCreditScore: parseInt(loan.co_borrower_credit_score || 0),
        firstTimeBuyer: loan.first_time_buyer,
        loanPurpose: loan.loan_purpose,
        numberOfUnits: parseInt(loan.number_of_units || 1),
        msa: loan.msa,
        mortgageInsurancePercentage: parseFloat(loan.mortgage_insurance_percentage || 0),
        amortizationType: loan.amortization_type,
        prepaymentPenalty: loan.prepayment_penalty,
        interestOnlyLoan: loan.interest_only_loan,
        loanPaymentHistory: loan.loan_payment_history,
        modificationFlag: loan.modification_flag,
        mortgageInsuranceCancellation: loan.mortgage_insurance_cancellation,
        zeroBalanceCode: loan.zero_balance_code,
        zeroBalanceEffectiveDate: loan.zero_balance_effective_date,
        upbAtRemoval: parseFloat(loan.upb_at_removal || 0),
        repurchaseDate: loan.repurchase_date,
        scheduledPrincipalCurrent: parseFloat(loan.scheduled_principal_current || 0),
        totalPrincipalCurrent: parseFloat(loan.total_principal_current || 0),
        unscheduledPrincipalCurrent: parseFloat(loan.unscheduled_principal_current || 0),
        lastPaidInstallmentDate: loan.last_paid_installment_date,
        foreclosureDate: loan.foreclosure_date,
        dispositionDate: loan.disposition_date,
        foreclosureCosts: parseFloat(loan.foreclosure_costs || 0),
        propertyPreservationCosts: parseFloat(loan.property_preservation_costs || 0),
        assetRecoveryCosts: parseFloat(loan.asset_recovery_costs || 0),
        miscHoldingExpenses: parseFloat(loan.misc_holding_expenses || 0),
        associatedTaxes: parseFloat(loan.associated_taxes || 0),
        netSalesProceeds: parseFloat(loan.net_sales_proceeds || 0),
        creditEnhancementProceeds: parseFloat(loan.credit_enhancement_proceeds || 0),
        repurchaseMakeWholeProceeds: parseFloat(loan.repurchase_make_whole_proceeds || 0),
        otherForeclosureProceeds: parseFloat(loan.other_foreclosure_proceeds || 0),
        modificationNonInterestBearingUPB: parseFloat(loan.modification_non_interest_bearing_upb || 0),
        principalForgivenessAmount: parseFloat(loan.principal_forgiveness_amount || 0),
        borrowerCreditScoreCurrent: parseInt(loan.borrower_credit_score_current || 0),
        coBorrowerCreditScoreCurrent: parseInt(loan.co_borrower_credit_score_current || 0),
        mortgageInsuranceType: loan.mortgage_insurance_type,
        servicingActivityIndicator: loan.servicing_activity_indicator,
        currentPeriodModificationLoss: parseFloat(loan.current_period_modification_loss || 0),
        cumulativeModificationLoss: parseFloat(loan.cumulative_modification_loss || 0),
        currentPeriodCreditEventLoss: parseFloat(loan.current_period_credit_event_loss || 0),
        cumulativeCreditEventLoss: parseFloat(loan.cumulative_credit_event_loss || 0),
        specialEligibilityProgram: loan.special_eligibility_program,
        foreclosurePrincipalWriteoff: parseFloat(loan.foreclosure_principal_writeoff || 0),
        relocationMortgageIndicator: loan.relocation_mortgage_indicator,
        highBalanceLoanIndicator: loan.high_balance_loan_indicator,
        dealName: loan.deal_name,
        interestBearingUPB: parseFloat(loan.interest_bearing_upb || 0)
      };
    });

    res.json(loans);
  } catch (error) {
    console.error('Error fetching loan details:', error);
    res.status(500).json({ error: 'Failed to load loan details' });
  }
});

// Get climate risk analytics for portfolio
router.get('/analytics/climate', async (req, res) => {
  try {
    const portfolioData = await readPortfolioData();
    const climateService = require('../services/climateService');

    // Transform portfolio data to include coordinates
    const loansWithCoords = portfolioData.map(loan => {
      const stateCoordinates = {
        'NY': { lat: 40.7128, lng: -74.0060 },
        'CA': { lat: 37.7749, lng: -122.4194 },
        'TX': { lat: 29.7604, lng: -95.3698 },
        'FL': { lat: 25.7617, lng: -80.1918 },
        'IL': { lat: 41.8781, lng: -87.6298 },
        'WA': { lat: 47.6062, lng: -122.3321 },
        'GA': { lat: 33.7490, lng: -84.3880 },
        'AZ': { lat: 33.4484, lng: -112.0740 },
        'MA': { lat: 42.3601, lng: -71.0589 },
        'NC': { lat: 35.7796, lng: -78.6382 }
      };

      const coords = stateCoordinates[loan.property_state] || { lat: 39.8283, lng: -98.5795 };

      return {
        ...loan,
        lat: coords.lat,
        lng: coords.lng,
        value: parseFloat(loan.original_upb || 0)
      };
    });

    const climateRisks = await climateService.calculatePortfolioClimateRisk(loansWithCoords);

    res.json(climateRisks);
  } catch (error) {
    console.error('Error calculating climate risk:', error);
    res.status(500).json({ error: 'Failed to calculate climate risk' });
  }
});

// Get portfolio performance analytics
router.get('/analytics/performance', async (req, res) => {
  try {
    const portfolioData = await readPortfolioData();

    const performanceAnalytics = {
      creditQuality: {
        averageCreditScore: portfolioData.reduce((sum, loan) => sum + parseFloat(loan.borrower_credit_score || 0), 0) / portfolioData.length,
        creditScoreDistribution: portfolioData.reduce((acc, loan) => {
          const score = parseInt(loan.borrower_credit_score || 0);
          if (score >= 800) acc.excellent++;
          else if (score >= 740) acc.veryGood++;
          else if (score >= 670) acc.good++;
          else if (score >= 580) acc.fair++;
          else acc.poor++;
          return acc;
        }, { excellent: 0, veryGood: 0, good: 0, fair: 0, poor: 0 })
      },
      ltvAnalysis: {
        averageLTV: portfolioData.reduce((sum, loan) => sum + parseFloat(loan.original_ltv || 0), 0) / portfolioData.length,
        ltvDistribution: portfolioData.reduce((acc, loan) => {
          const ltv = parseFloat(loan.original_ltv || 0);
          if (ltv <= 60) acc.low++;
          else if (ltv <= 80) acc.moderate++;
          else if (ltv <= 95) acc.high++;
          else acc.veryHigh++;
          return acc;
        }, { low: 0, moderate: 0, high: 0, veryHigh: 0 })
      },
      maturityProfile: {
        averageRemainingTerm: portfolioData.reduce((sum, loan) => {
          const remaining = parseInt(loan.original_loan_term || 0) - parseInt(loan.loan_age || 0);
          return sum + remaining;
        }, 0) / portfolioData.length,
        maturityDistribution: portfolioData.reduce((acc, loan) => {
          const remaining = parseInt(loan.original_loan_term || 0) - parseInt(loan.loan_age || 0);
          if (remaining <= 60) acc.shortTerm++;
          else if (remaining <= 120) acc.mediumTerm++;
          else acc.longTerm++;
          return acc;
        }, { shortTerm: 0, mediumTerm: 0, longTerm: 0 })
      }
    };

    res.json(performanceAnalytics);
  } catch (error) {
    console.error('Error generating performance analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

module.exports = router;