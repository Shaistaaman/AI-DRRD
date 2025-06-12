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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// Components
import RiskMetricCard from '../components/RiskMetricCard';
import RiskChart from '../components/RiskChart';
import USRiskMap from '../components/USRiskMap';

// Sample data
const portfolioSummary = {
  totalLoans: 1250,
  totalValue: 375000000,
  averageLTV: 0.72
};

const riskDistribution = [
  { name: 'Low Risk', value: 450 },
  { name: 'Medium Risk', value: 600 },
  { name: 'High Risk', value: 200 }
];

const regionalExposure = [
  { name: 'Northeast', value: 95000000 },
  { name: 'Southeast', value: 125000000 },
  { name: 'Midwest', value: 55000000 },
  { name: 'Southwest', value: 45000000 },
  { name: 'West', value: 55000000 }
];

const historicalLosses = [
  { name: '2019', value: 12500000 },
  { name: '2020', value: 15700000 },
  { name: '2021', value: 23400000 },
  { name: '2022', value: 17800000 },
  { name: '2023', value: 21300000 }
];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [alertData, setAlertData] = useState({
    show: true,
    severity: 'warning',
    message: 'Hurricane warning active for Southeast region. 127 properties potentially affected.'
  });

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          {/* Portfolio Summary */}
          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Total Portfolio Value"
                value={loading ? <Skeleton width={100} /> : `$${(portfolioSummary.totalValue / 1000000).toFixed(1)}M`}
                icon={<AccountBalanceIcon sx={{ color: 'primary.dark' }} />}
                color="primary"
              />
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Number of Loans"
                value={loading ? <Skeleton width={100} /> : portfolioSummary.totalLoans}
                icon={<AccountBalanceIcon sx={{ color: 'secondary.dark' }} />}
                color="secondary"
              />
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Average LTV"
                value={loading ? <Skeleton width={100} /> : (portfolioSummary.averageLTV * 100).toFixed(1)}
                unit="%"
                progress={portfolioSummary.averageLTV * 100}
                icon={<AccountBalanceIcon sx={{ color: 'info.dark' }} />}
                color="info"
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
                value={loading ? <Skeleton width={100} /> : "$42.5M"}
                icon={<WaterIcon sx={{ color: 'primary.dark' }} />}
                color="primary"
              />
            </motion.div>
          </Grid>

          <Grid item xs={6} sm={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Fire Risk"
                value={loading ? <Skeleton width={100} /> : "$28.7M"}
                icon={<LocalFireDepartmentIcon sx={{ color: 'error.dark' }} />}
                color="error"
              />
            </motion.div>
          </Grid>

          <Grid item xs={6} sm={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Wind Risk"
                value={loading ? <Skeleton width={100} /> : "$35.2M"}
                icon={<AirIcon sx={{ color: 'info.dark' }} />}
                color="info"
              />
            </motion.div>
          </Grid>

          <Grid item xs={6} sm={3}>
            <motion.div variants={itemVariants}>
              <RiskMetricCard
                title="Heat Risk"
                value={loading ? <Skeleton width={100} /> : "$18.9M"}
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
                  <USRiskMap hazardType="all" timeframe={2023} mapStyle="map" />
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