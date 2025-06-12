import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Chip, 
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import WaterIcon from '@mui/icons-material/Water';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AirIcon from '@mui/icons-material/Air';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import WarningIcon from '@mui/icons-material/Warning';

// Services
import { getMockWeatherData, calculateWeatherRisk } from '../services/weatherService';
import { getLoansByRegion } from '../services/portfolioService';

const WeatherRiskAssessment = ({ region }) => {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [loans, setLoans] = useState([]);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get weather data for the region
        const weather = await getMockWeatherData(region);
        setWeatherData(weather);
        
        // Get loans for the region
        const regionLoans = getLoansByRegion(region);
        setLoans(regionLoans);
        
        // Calculate total portfolio value and risk
        let totalValue = 0;
        let totalExpectedLoss = 0;
        let highRiskLoans = 0;
        
        const loansWithRisk = regionLoans.map(loan => {
          const risk = calculateWeatherRisk(weather, loan.value);
          totalValue += loan.value;
          totalExpectedLoss += risk.expectedLoss;
          
          if (risk.riskLevel === 'high') {
            highRiskLoans++;
          }
          
          return {
            ...loan,
            weatherRisk: risk
          };
        });
        
        setRiskAssessment({
          totalValue,
          totalExpectedLoss,
          percentageAtRisk: (totalExpectedLoss / totalValue) * 100,
          highRiskLoans,
          loansWithRisk
        });
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch weather and risk data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [region]);
  
  const getWeatherIcon = (weatherMain) => {
    switch (weatherMain) {
      case 'Rain':
        return <WaterIcon fontSize="large" />;
      case 'Thunderstorm':
        return <ThunderstormIcon fontSize="large" />;
      case 'Clear':
        return <WbSunnyIcon fontSize="large" />;
      case 'Clouds':
        return <CloudIcon fontSize="large" />;
      default:
        return <CloudIcon fontSize="large" />;
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
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  if (!weatherData || !riskAssessment) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No weather or portfolio data available for this region.
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Current Weather Risk Assessment
        </Typography>
        
        <Grid container spacing={3}>
          {/* Weather Information */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'primary.light', 
                color: 'white', 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getWeatherIcon(weatherData.weather.main)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Current Weather
                </Typography>
              </Box>
              
              <Typography variant="body1" gutterBottom>
                {weatherData.weather.description.charAt(0).toUpperCase() + weatherData.weather.description.slice(1)}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Temperature: {weatherData.main.temp}°C
                </Typography>
                <Typography variant="body2">
                  Humidity: {weatherData.main.humidity}%
                </Typography>
                <Typography variant="body2">
                  Wind: {weatherData.wind.speed} m/s
                </Typography>
                {weatherData.rain && (
                  <Typography variant="body2">
                    Rainfall: {weatherData.rain['1h']} mm/h
                  </Typography>
                )}
              </Box>
              
              {weatherData.alerts && weatherData.alerts.length > 0 && (
                <Box sx={{ mt: 'auto', pt: 2 }}>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 1 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ mr: 1 }} />
                    <Typography variant="body2" fontWeight="bold">
                      Weather Alerts
                    </Typography>
                  </Box>
                  {weatherData.alerts.map((alert, index) => (
                    <Typography key={index} variant="body2" sx={{ mt: 1 }}>
                      {alert.event}: {alert.description}
                    </Typography>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Portfolio Risk Summary */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 2,
                border: '1px solid rgba(0,0,0,0.12)',
                height: '100%'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Portfolio Risk Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Portfolio Value
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(riskAssessment.totalValue)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Expected Loss (Current Weather)
                    </Typography>
                    <Typography variant="h5" color="error.main">
                      {formatCurrency(riskAssessment.totalExpectedLoss)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Percentage at Risk
                    </Typography>
                    <Typography variant="h5" color={riskAssessment.percentageAtRisk > 10 ? "error.main" : "text.primary"}>
                      {riskAssessment.percentageAtRisk.toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Properties at High Risk
                    </Typography>
                    <Typography variant="h5" color={riskAssessment.highRiskLoans > 0 ? "error.main" : "text.primary"}>
                      {riskAssessment.highRiskLoans} of {loans.length}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Properties at Risk
              </Typography>
              
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {riskAssessment.loansWithRisk.map((loan) => (
                  <Box 
                    key={loan.id}
                    component={motion.div}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                    sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      mb: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography variant="body2">
                        {loan.address}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Value: {formatCurrency(loan.value)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Loss: {formatCurrency(loan.weatherRisk.expectedLoss)}
                      </Typography>
                      <Chip 
                        label={loan.weatherRisk.riskLevel.toUpperCase()} 
                        size="small"
                        color={
                          loan.weatherRisk.riskLevel === 'high' ? 'error' :
                          loan.weatherRisk.riskLevel === 'medium' ? 'warning' : 'success'
                        }
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default WeatherRiskAssessment;