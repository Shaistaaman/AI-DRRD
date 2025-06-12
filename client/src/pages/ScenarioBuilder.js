import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Paper
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import ScenarioSlider from '../components/ScenarioSlider';
import RiskChart from '../components/RiskChart';
import USRiskMap from '../components/USRiskMap';

const ScenarioBuilder = () => {
  const [scenario, setScenario] = useState({
    hazardType: 'flood',
    returnPeriod: 100,
    intensity: 3
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScenarioChange = (newScenario) => {
    setScenario(newScenario);
    // Reset results when scenario changes
    setResults(null);
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      // For demo, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResults = {
        id: `analysis-${Date.now()}`,
        timestamp: new Date().toISOString(),
        parameters: { ...scenario },
        results: {
          totalExpectedLoss: 25000000 + (scenario.intensity * 5000000) + (Math.random() * 10000000),
          percentageOfPortfolio: 0.05 + (scenario.intensity * 0.02) + (Math.random() * 0.03),
          affectedProperties: 200 + (scenario.intensity * 50) + Math.floor(Math.random() * 100),
          riskHotspots: [
            { region: 'Miami-Dade, FL', expectedLoss: 8000000 + (scenario.intensity * 1000000) },
            { region: 'Houston, TX', expectedLoss: 6000000 + (scenario.intensity * 800000) },
            { region: 'New Orleans, LA', expectedLoss: 5000000 + (scenario.intensity * 700000) }
          ],
          ltvImpact: 0.02 + (scenario.intensity * 0.005) + (Math.random() * 0.01),
          regionalImpact: [
            { name: 'Northeast', value: 5000000 + (scenario.intensity * 500000) },
            { name: 'Southeast', value: 12000000 + (scenario.intensity * 1500000) },
            { name: 'Midwest', value: 3000000 + (scenario.intensity * 300000) },
            { name: 'Southwest', value: 2500000 + (scenario.intensity * 250000) },
            { name: 'West', value: 2500000 + (scenario.intensity * 250000) }
          ]
        }
      };

      setResults(mockResults);
    } catch (err) {
      setError('Failed to run analysis. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Scenario Builder
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <ScenarioSlider onScenarioChange={handleScenarioChange} />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              disabled={loading}
              onClick={runAnalysis}
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{ px: 4 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Run Analysis'
              )}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Grid>

        <Grid item xs={12} md={7}>
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Analysis Results
                      </Typography>
                      <Chip
                        label={`ID: ${results.id.substring(0, 10)}...`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Paper
                          elevation={0}
                          sx={{ p: 2, bgcolor: 'primary.light', color: 'white', borderRadius: 2 }}
                          component={motion.div}
                          whileHover={{ y: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Typography variant="body2">Total Expected Loss</Typography>
                          <Typography variant="h4">
                            {formatCurrency(results.results.totalExpectedLoss)}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Paper
                          elevation={0}
                          sx={{ p: 2, bgcolor: 'secondary.light', color: 'white', borderRadius: 2 }}
                          component={motion.div}
                          whileHover={{ y: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Typography variant="body2">Affected Properties</Typography>
                          <Typography variant="h4">
                            {results.results.affectedProperties}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Paper
                          elevation={0}
                          sx={{ p: 2, bgcolor: 'info.light', color: 'white', borderRadius: 2 }}
                          component={motion.div}
                          whileHover={{ y: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Typography variant="body2">Portfolio Impact</Typography>
                          <Typography variant="h4">
                            {(results.results.percentageOfPortfolio * 100).toFixed(1)}%
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Paper
                          elevation={0}
                          sx={{ p: 2, bgcolor: 'warning.light', color: 'white', borderRadius: 2 }}
                          component={motion.div}
                          whileHover={{ y: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Typography variant="body2">LTV Impact</Typography>
                          <Typography variant="h4">
                            +{(results.results.ltvImpact * 100).toFixed(1)}%
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>
                      Regional Impact
                    </Typography>

                    <RiskChart
                      type="bar"
                      data={results.results.regionalImpact.map(item => ({
                        name: item.name,
                        value: item.value / 1000000 // Convert to millions
                      }))}
                      title="Expected Loss by Region ($M)"
                      height={250}
                    />

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        component={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Export Results
                      </Button>

                      <Button
                        variant="contained"
                        color="secondary"
                        component={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Save Scenario
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CardContent sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" gutterBottom>
                      Configure your scenario parameters
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Adjust the hazard type, intensity, and return period, then run the analysis to see the impact on your portfolio.
                    </Typography>
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        transition: {
                          repeat: Infinity,
                          duration: 2
                        }
                      }}
                    >
                      <Box
                        component="img"
                        src="/images/analyze.svg"
                        alt="Analysis"
                        sx={{ width: 30, height: 30, opacity: 0.7 }}
                      />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>

        {results && (
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Risk Hotspots
                  </Typography>
                  <USRiskMap
                    hazardType={scenario.hazardType}
                    timeframe={2050}
                    mapStyle="map"
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ScenarioBuilder;