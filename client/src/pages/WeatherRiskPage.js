import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';

// Components
import WeatherRiskAssessment from '../components/WeatherRiskAssessment';
import RiskMap from '../components/RiskMap';

// Services
import { getCurrentYearLoanPlans } from '../services/portfolioService';

const regions = [
  { value: 'Miami', label: 'Miami, FL' },
  { value: 'Houston', label: 'Houston, TX' },
  { value: 'NewOrleans', label: 'New Orleans, LA' },
  { value: 'NewYork', label: 'New York, NY' },
  { value: 'SanFrancisco', label: 'San Francisco, CA' }
];

const WeatherRiskPage = () => {
  const [selectedRegion, setSelectedRegion] = useState('Miami');
  const loanPlans = getCurrentYearLoanPlans();
  
  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Weather Risk Assessment
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Region
                </Typography>
                
                <FormControl fullWidth>
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={selectedRegion}
                    label="Region"
                    onChange={handleRegionChange}
                  >
                    {regions.map((region) => (
                      <MenuItem key={region.value} value={region.value}>
                        {region.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  2024 Loan Plans
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Current loan plans with climate risk considerations:
                </Typography>
                
                {loanPlans.map((plan, index) => (
                  <React.Fragment key={plan.id}>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <Box>
                      <Typography variant="subtitle2">
                        {plan.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          Rate: {plan.interestRate}%
                        </Typography>
                        <Typography variant="body2">
                          Min. Down: {(plan.minimumDownPayment * 100)}%
                        </Typography>
                        <Typography variant="body2">
                          Risk Level: {plan.riskLevel.toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                  </React.Fragment>
                ))}
                
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  component={motion.button}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View All Loan Plans
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WeatherRiskAssessment region={selectedRegion} />
            
            <Box sx={{ mt: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Weather Risk Map
                  </Typography>
                  <RiskMap 
                    region={selectedRegion} 
                    hazardType="flood" 
                    timeframe={2023}
                    mapStyle="map"
                  />
                </CardContent>
              </Card>
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WeatherRiskPage;