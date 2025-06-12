import React, { useState } from 'react';
import { 
  Box, 
  Slider, 
  Typography, 
  Card, 
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { motion } from 'framer-motion';

const hazardTypes = [
  { value: 'flood', label: 'Flooding' },
  { value: 'fire', label: 'Wildfire' },
  { value: 'wind', label: 'Windstorm' },
  { value: 'heat', label: 'Heatwave' }
];

const returnPeriods = [
  { value: 10, label: '1-in-10 year' },
  { value: 20, label: '1-in-20 year' },
  { value: 50, label: '1-in-50 year' },
  { value: 100, label: '1-in-100 year' },
  { value: 500, label: '1-in-500 year' }
];

const ScenarioSlider = ({ onScenarioChange }) => {
  const [hazardType, setHazardType] = useState('flood');
  const [returnPeriod, setReturnPeriod] = useState(100);
  const [intensity, setIntensity] = useState(3);
  
  const handleHazardChange = (event) => {
    setHazardType(event.target.value);
    if (onScenarioChange) {
      onScenarioChange({
        hazardType: event.target.value,
        returnPeriod,
        intensity
      });
    }
  };
  
  const handleReturnPeriodChange = (event) => {
    setReturnPeriod(event.target.value);
    if (onScenarioChange) {
      onScenarioChange({
        hazardType,
        returnPeriod: event.target.value,
        intensity
      });
    }
  };
  
  const handleIntensityChange = (event, newValue) => {
    setIntensity(newValue);
    if (onScenarioChange) {
      onScenarioChange({
        hazardType,
        returnPeriod,
        intensity: newValue
      });
    }
  };
  
  const getIntensityLabel = () => {
    if (intensity <= 1) return 'Minor';
    if (intensity <= 2) return 'Moderate';
    if (intensity <= 3) return 'Significant';
    if (intensity <= 4) return 'Severe';
    return 'Extreme';
  };
  
  const getIntensityColor = () => {
    if (intensity <= 1) return '#2e7d32';
    if (intensity <= 2) return '#4caf50';
    if (intensity <= 3) return '#ff9800';
    if (intensity <= 4) return '#f57c00';
    return '#d32f2f';
  };

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Scenario Parameters
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Hazard Type</InputLabel>
              <Select
                value={hazardType}
                label="Hazard Type"
                onChange={handleHazardChange}
              >
                {hazardTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Return Period</InputLabel>
              <Select
                value={returnPeriod}
                label="Return Period"
                onChange={handleReturnPeriodChange}
              >
                {returnPeriods.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ mb: 2 }}>
          <Typography id="intensity-slider" gutterBottom>
            Hazard Intensity
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <Slider
                value={intensity}
                onChange={handleIntensityChange}
                aria-labelledby="intensity-slider"
                step={0.1}
                marks
                min={0}
                max={5}
                valueLabelDisplay="auto"
                sx={{
                  '& .MuiSlider-thumb': {
                    height: 24,
                    width: 24,
                    backgroundColor: '#fff',
                    border: '2px solid currentColor',
                    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.16)',
                    },
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: getIntensityColor(),
                  },
                  '& .MuiSlider-rail': {
                    opacity: 0.5,
                    backgroundColor: '#bfbfbf',
                  },
                }}
              />
            </Box>
            <Box
              component={motion.div}
              animate={{ 
                scale: [1, 1.1, 1],
                transition: { repeat: Infinity, duration: 2 }
              }}
              sx={{ 
                minWidth: 100, 
                p: 1, 
                borderRadius: 1, 
                bgcolor: getIntensityColor(),
                color: '#fff',
                textAlign: 'center'
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {getIntensityLabel()}
              </Typography>
              <Typography variant="caption">
                {intensity.toFixed(1)} / 5.0
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
          <Typography variant="body2">
            This scenario simulates a {getIntensityLabel().toLowerCase()} {hazardType} event 
            with a {returnPeriod}-year return period.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ScenarioSlider;