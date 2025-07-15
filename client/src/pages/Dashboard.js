import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Skeleton
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import WaterIcon from '@mui/icons-material/Water';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AirIcon from '@mui/icons-material/Air';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PercentIcon from '@mui/icons-material/Percent';
import NumbersIcon from '@mui/icons-material/Numbers';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import CalculateIcon from '@mui/icons-material/Calculate';
// Components
import RiskMetricCard from '../components/RiskMetricCard';
import RiskChart from '../components/RiskChart';
import USRiskMap from '../components/USRiskMap';

// API service functions
const fetchPortfolioSummary = async () => {
  const response = await fetch('/api/portfolio');
  if (!response.ok) throw new Error('Failed to fetch portfolio summary');
  return response.json();
};

const fetchPortfolioLoans = async () => {
  const response = await fetch('/api/portfolio/loans');
  if (!response.ok) throw new Error('Failed to fetch portfolio loans');
  return response.json();
};

const fetchClimateRisk = async () => {
  const response = await fetch('/api/portfolio/analytics/climate');
  if (!response.ok) throw new Error('Failed to fetch climate risk data');
  return response.json();
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState(null);
  const [loans, setLoans] = useState([]);
  const [climateRisk, setClimateRisk] = useState(null);
  const [error, setError] = useState(null);
  const [alertData, setAlertData] = useState({
    show: true,
    severity: 'warning',
    message: 'Hurricane warning active for Southeast region. 127 properties potentially affected.'
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch portfolio summary, loan details, and climate risk data
        const [summaryData, loansData, climateData] = await Promise.all([
          fetchPortfolioSummary(),
          fetchPortfolioLoans(),
          fetchClimateRisk().catch(() => null) // Don't fail if climate data unavailable
        ]);

        setPortfolioData(summaryData);
        setLoans(loansData);
        setClimateRisk(climateData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Calculate derived data from real portfolio data
  const riskDistribution = React.useMemo(() => {
    if (!loans.length) return [];

    const riskCounts = loans.reduce((acc, loan) => {
      acc[loan.risk] = (acc[loan.risk] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Low Risk', value: riskCounts.low || 0 },
      { name: 'Medium Risk', value: riskCounts.medium || 0 },
      { name: 'High Risk', value: riskCounts.high || 0 }
    ];
  }, [loans]);

  const regionalExposure = React.useMemo(() => {
    if (!loans.length) return [];

    const stateData = loans.reduce((acc, loan) => {
      const state = loan.state || 'Unknown';
      if (!acc[state]) {
        acc[state] = { name: state, value: 0 };
      }
      acc[state].value += loan.value;
      return acc;
    }, {});

    return Object.values(stateData);
  }, [loans]);

  // Calculate historical data from portfolio (based on loan origination years)
  const historicalLosses = React.useMemo(() => {
    if (!loans.length) return [];

    // Group loans by origination year and calculate potential exposure
    const yearlyData = loans.reduce((acc, loan) => {
      // Extract year from origination date (format: MMYYYY or similar)
      const originationDate = loan.originationDate || '';
      let year = 'Unknown';

      if (originationDate.length >= 4) {
        // Try to extract year from various date formats
        if (originationDate.length === 5) { // MMYYYY format
          year = '20' + originationDate.substring(3, 5);
        } else if (originationDate.length === 6) { // MMYYYY format
          year = originationDate.substring(2, 6);
        }
      }

      if (year !== 'Unknown' && year >= '2019' && year <= '2024') {
        if (!acc[year]) {
          acc[year] = { name: year, value: 0 };
        }
        // Use delinquent loans as proxy for historical losses
        if (loan.delinquencyStatus > 0) {
          acc[year].value += loan.value * 0.1; // Assume 10% loss on delinquent loans
        }
      }
      return acc;
    }, {});

    // If no data available, show message
    if (Object.keys(yearlyData).length === 0) {
      return [{ name: 'No historical data', value: 0 }];
    }

    return Object.values(yearlyData).sort((a, b) => a.name.localeCompare(b.name));
  }, [loans]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Risk Dashboard
        </Typography>
        <Button
          variant="contained"
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Generate Report
        </Button>
      </Box>

      {alertData.show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert
            severity={alertData.severity}
            sx={{ mb: 3 }}
            onClose={() => setAlertData({ ...alertData, show: false })}
          >
            {alertData.message}
          </Alert>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            Error loading dashboard data: {error}
          </Alert>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          {/* First Row - Portfolio Summary Metrics */}
          <Grid item xs={12} md={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Total Portfolio Value"
                value={loading ? <Skeleton width={100} /> : portfolioData ? `$${(portfolioData.summary.totalOriginalUPB / 1000000).toFixed(1)}M` : 'N/A'}
                icon={<AttachMoneyIcon sx={{ color: 'success.dark' }} />}
                color="success"
              />
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Number of Loans"
                value={loading ? <Skeleton width={100} /> : portfolioData ? portfolioData.summary.totalLoans.toLocaleString() : 'N/A'}
                icon={<CalculateIcon sx={{ color: 'primary.dark' }} />}
                color="primary"
              />
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Average LTV"
                value={loading ? <Skeleton width={100} /> : portfolioData ? `${portfolioData.summary.averageLTV}%` : 'N/A'}
                icon={<PercentIcon sx={{ color: 'error.dark' }} />}
                color="error"
              />
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Average Credit Score"
                value={loading ? <Skeleton width={100} /> : portfolioData ? Math.round(portfolioData.summary.averageCreditScore) : 'N/A'}
                icon={<CalculateIcon sx={{ color: 'warning.dark' }} />}
                color="warning"
              />
            </motion.div>
          </Grid>

          {/* Second Row - Risk & Performance Metrics */}
          <Grid item xs={12} md={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Average DTI"
                value={loading ? <Skeleton width={100} /> : portfolioData ? `${portfolioData.summary.averageDTI.toFixed(1)}%` : 'N/A'}
                icon={<PercentIcon sx={{ color: 'success.dark' }} />}
                color="success"
              />
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Delinquent Loans"
                value={loading ? <Skeleton width={100} /> : portfolioData ? (portfolioData.delinquencyStats.early + portfolioData.delinquencyStats.moderate + portfolioData.delinquencyStats.severe).toLocaleString() : 'N/A'}
                icon={<WarningIcon sx={{ color: 'primary.dark' }} />}
                color="primary"
              />
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Current UPB"
                value={loading ? <Skeleton width={100} /> : portfolioData ? `$${(portfolioData.summary.totalCurrentUPB / 1000000).toFixed(1)}M` : 'N/A'}
                icon={<AttachMoneyIcon sx={{ color: 'error.dark' }} />}
                color="error"
              />
            </motion.div>
          </Grid>

          <Grid item xs={12} md={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Average Loan Age"
                value={loading ? <Skeleton width={100} /> : portfolioData ? `${Math.round(portfolioData.performanceMetrics.weightedAverageAge)} months` : 'N/A'}
                icon={<AccessTimeIcon sx={{ color: 'warning.dark' }} />}
                color="warning"
              />
            </motion.div>
          </Grid>

          {/* Risk Metrics */}
          <Grid item xs={12}>
            <motion.div variants={itemVariants}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Physical Risk Exposure
              </Typography>
            </motion.div>
          </Grid>

          <Grid item xs={6} sm={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Flood Risk"
                value={loading ? <Skeleton width={100} /> :
                  climateRisk && climateRisk.flood ?
                    `$${(climateRisk.flood.totalExposure / 1000000).toFixed(1)}M` :
                    "Data not provided yet"
                }
                icon={<WaterIcon sx={{ color: 'primary.dark' }} />}
                color="primary"
              />
            </motion.div>
          </Grid>

          <Grid item xs={6} sm={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Fire Risk"
                value={loading ? <Skeleton width={100} /> :
                  climateRisk && climateRisk.fire ?
                    `$${(climateRisk.fire.totalExposure / 1000000).toFixed(1)}M` :
                    "Data not provided yet"
                }
                icon={<LocalFireDepartmentIcon sx={{ color: 'error.dark' }} />}
                color="error"
              />
            </motion.div>
          </Grid>

          <Grid item xs={6} sm={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Wind Risk"
                value={loading ? <Skeleton width={100} /> :
                  climateRisk && climateRisk.wind ?
                    `$${(climateRisk.wind.totalExposure / 1000000).toFixed(1)}M` :
                    "Data not provided yet"
                }
                icon={<AirIcon sx={{ color: 'info.dark' }} />}
                color="info"
              />
            </motion.div>
          </Grid>

          <Grid item xs={6} sm={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Heat Risk"
                value={loading ? <Skeleton width={100} /> :
                  climateRisk && climateRisk.heat ?
                    `$${(climateRisk.heat.totalExposure / 1000000).toFixed(1)}M` :
                    "Data not provided yet"
                }
                icon={<ThermostatIcon sx={{ color: 'warning.dark' }} />}
                color="warning"
              />
            </motion.div>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <RiskChart
                type="pie"
                data={riskDistribution}
                title="Portfolio Risk Distribution"
                height={300}
              />
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div variants={itemVariants}>
              <RiskChart
                type="bar"
                data={regionalExposure.map(item => ({
                  name: item.name,
                  value: item.value / 1000000 // Convert to millions
                }))}
                title="Regional Exposure ($M)"
                height={300}
              />
            </motion.div>
          </Grid>

          {/* Map */}
          <Grid item xs={12}>
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Risk Hotspots
                  </Typography>
                  <USRiskMap
                    hazardType="all"
                    timeframe={2023}
                    mapStyle="map"
                    portfolioData={loans}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Historical Losses */}
          <Grid item xs={12}>
            <motion.div variants={itemVariants}>
              <RiskChart
                type="line"
                data={historicalLosses.map(item => ({
                  name: item.name,
                  value: item.value / 1000000 // Convert to millions
                }))}
                title="Historical Losses by Year ($M)"
                height={300}
              />
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};

export default Dashboard;