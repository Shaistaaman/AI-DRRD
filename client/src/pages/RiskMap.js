import React, { useState } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import WaterIcon from '@mui/icons-material/Water';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AirIcon from '@mui/icons-material/Air';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import LayersIcon from '@mui/icons-material/Layers';
import MapIcon from '@mui/icons-material/Map';
import SatelliteIcon from '@mui/icons-material/Satellite';

// Components
import RiskMap from '../components/RiskMap';

const regions = [
  { value: 'Miami', label: 'Miami, FL' },
  { value: 'Houston', label: 'Houston, TX' },
  { value: 'NewOrleans', label: 'New Orleans, LA' },
  { value: 'NewYork', label: 'New York, NY' },
  { value: 'SanFrancisco', label: 'San Francisco, CA' }
];

const hazardTypes = [
  { value: 'flood', label: 'Flooding', icon: <WaterIcon /> },
  { value: 'fire', label: 'Wildfire', icon: <LocalFireDepartmentIcon /> },
  { value: 'wind', label: 'Windstorm', icon: <AirIcon /> },
  { value: 'heat', label: 'Heatwave', icon: <ThermostatIcon /> }
];

const RiskMapPage = () => {
  const [selectedRegion, setSelectedRegion] = useState('Miami');
  const [selectedHazard, setSelectedHazard] = useState('flood');
  const [mapStyle, setMapStyle] = useState('map');
  const [timeframe, setTimeframe] = useState(2050);
  
  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };
  
  const handleHazardChange = (event) => {
    setSelectedHazard(event.target.value);
  };
  
  const handleMapStyleChange = (event, newMapStyle) => {
    if (newMapStyle !== null) {
      setMapStyle(newMapStyle);
    }
  };
  
  const handleTimeframeChange = (event, newValue) => {
    setTimeframe(newValue);
  };
  
  const getTimeframeLabel = (value) => {
    if (value === 2023) return 'Present';
    if (value === 2050) return 'Mid-century';
    if (value === 2100) return 'End-century';
    return value;
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Risk Map
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Map Controls
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
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
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Hazard Type</InputLabel>
                  <Select
                    value={selectedHazard}
                    label="Hazard Type"
                    onChange={handleHazardChange}
                  >
                    {hazardTypes.map((hazard) => (
                      <MenuItem key={hazard.value} value={hazard.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {hazard.icon}
                          <Box sx={{ ml: 1 }}>{hazard.label}</Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box sx={{ mb: 3 }}>
                  <Typography id="timeframe-slider" gutterBottom>
                    Timeframe
                  </Typography>
                  <Slider
                    value={timeframe}
                    onChange={handleTimeframeChange}
                    aria-labelledby="timeframe-slider"
                    step={null}
                    marks={[
                      { value: 2023, label: '2023' },
                      { value: 2050, label: '2050' },
                      { value: 2100, label: '2100' }
                    ]}
                    min={2023}
                    max={2100}
                    valueLabelDisplay="auto"
                    valueLabelFormat={getTimeframeLabel}
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>
                    Map Style
                  </Typography>
                  <ToggleButtonGroup
                    value={mapStyle}
                    exclusive
                    onChange={handleMapStyleChange}
                    aria-label="map style"
                    fullWidth
                  >
                    <ToggleButton value="map" aria-label="map view">
                      <MapIcon />
                    </ToggleButton>
                    <ToggleButton value="satellite" aria-label="satellite view">
                      <SatelliteIcon />
                    </ToggleButton>
                    <ToggleButton value="hybrid" aria-label="hybrid view">
                      <LayersIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography gutterBottom>
                    Legend
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        bgcolor: '#d32f2f',
                        mr: 1
                      }} />
                      <Typography variant="body2">High Risk</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        bgcolor: '#ed6c02',
                        mr: 1
                      }} />
                      <Typography variant="body2">Medium Risk</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        bgcolor: '#2e7d32',
                        mr: 1
                      }} />
                      <Typography variant="body2">Low Risk</Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
                  <Typography variant="body2">
                    Viewing {selectedHazard} risk in {regions.find(r => r.value === selectedRegion)?.label} for {getTimeframeLabel(timeframe)} scenario.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {selectedHazard.charAt(0).toUpperCase() + selectedHazard.slice(1)} Risk Map
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      icon={hazardTypes.find(h => h.value === selectedHazard)?.icon}
                      label={hazardTypes.find(h => h.value === selectedHazard)?.label}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                    <Chip 
                      label={regions.find(r => r.value === selectedRegion)?.label}
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                    <Chip 
                      label={getTimeframeLabel(timeframe)}
                      color="info"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
                
                <RiskMap 
                  hazardType={selectedHazard} 
                  region={selectedRegion}
                  timeframe={timeframe}
                  mapStyle={mapStyle}
                />
                
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    This map shows the projected {selectedHazard} risk for properties in {regions.find(r => r.value === selectedRegion)?.label} based on climate models for {getTimeframeLabel(timeframe)}. Click on markers to see property details.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RiskMapPage;