import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import { Box, Typography, Paper, Chip } from '@mui/material';
import L from 'leaflet';

// Sample data for properties across the US
const sampleProperties = [
  // Miami
  { id: 1, lat: 25.7617, lng: -80.1918, risk: 'high', value: 450000, address: '123 Ocean Dr, Miami, FL' },
  { id: 2, lat: 25.7827, lng: -80.2094, risk: 'medium', value: 320000, address: '456 Biscayne Blvd, Miami, FL' },
  // Houston
  { id: 4, lat: 29.7604, lng: -95.3698, risk: 'high', value: 380000, address: '321 Main St, Houston, TX' },
  { id: 5, lat: 29.7633, lng: -95.3633, risk: 'medium', value: 290000, address: '654 Travis St, Houston, TX' },
  // New Orleans
  { id: 6, lat: 29.9511, lng: -90.0715, risk: 'high', value: 410000, address: '789 Canal St, New Orleans, LA' },
  // New York
  { id: 7, lat: 40.7128, lng: -74.0060, risk: 'medium', value: 950000, address: '123 Broadway, New York, NY' },
  // San Francisco
  { id: 8, lat: 37.7749, lng: -122.4194, risk: 'low', value: 1250000, address: '456 Market St, San Francisco, CA' },
  // Chicago
  { id: 9, lat: 41.8781, lng: -87.6298, risk: 'medium', value: 520000, address: '789 Michigan Ave, Chicago, IL' },
  // Seattle
  { id: 10, lat: 47.6062, lng: -122.3321, risk: 'low', value: 680000, address: '123 Pike St, Seattle, WA' },
  // Denver
  { id: 11, lat: 39.7392, lng: -104.9903, risk: 'medium', value: 450000, address: '456 16th St, Denver, CO' },
  // Phoenix
  { id: 12, lat: 33.4484, lng: -112.0740, risk: 'high', value: 380000, address: '789 Central Ave, Phoenix, AZ' }
];

// Risk zones across the US
const riskZones = [
  // Miami (Flood)
  { id: 1, lat: 25.77, lng: -80.20, risk: 'high', radius: 30000, hazard: 'flood', region: 'Florida', affectedProperties: 120, expectedLoss: 25000000 },
  // Houston (Flood)
  { id: 2, lat: 29.76, lng: -95.37, risk: 'high', radius: 35000, hazard: 'flood', region: 'Texas', affectedProperties: 150, expectedLoss: 32000000 },
  // New Orleans (Flood)
  { id: 3, lat: 29.95, lng: -90.07, risk: 'high', radius: 25000, hazard: 'flood', region: 'Louisiana', affectedProperties: 90, expectedLoss: 18000000 },
  // California (Fire)
  { id: 4, lat: 37.77, lng: -122.41, risk: 'high', radius: 40000, hazard: 'fire', region: 'California', affectedProperties: 110, expectedLoss: 45000000 },
  { id: 5, lat: 34.05, lng: -118.24, risk: 'high', radius: 45000, hazard: 'fire', region: 'California', affectedProperties: 130, expectedLoss: 52000000 },
  // Midwest (Tornado)
  { id: 6, lat: 39.10, lng: -94.58, risk: 'medium', radius: 50000, hazard: 'wind', region: 'Kansas', affectedProperties: 85, expectedLoss: 15000000 },
  { id: 7, lat: 35.47, lng: -97.52, risk: 'high', radius: 40000, hazard: 'wind', region: 'Oklahoma', affectedProperties: 95, expectedLoss: 22000000 },
  // East Coast (Hurricane)
  { id: 8, lat: 35.22, lng: -80.84, risk: 'medium', radius: 60000, hazard: 'wind', region: 'North Carolina', affectedProperties: 110, expectedLoss: 28000000 },
  { id: 9, lat: 32.78, lng: -79.93, risk: 'high', radius: 55000, hazard: 'wind', region: 'South Carolina', affectedProperties: 125, expectedLoss: 31000000 },
  // Southwest (Heat)
  { id: 10, lat: 33.45, lng: -112.07, risk: 'high', radius: 50000, hazard: 'heat', region: 'Arizona', affectedProperties: 80, expectedLoss: 16000000 },
  { id: 11, lat: 36.17, lng: -115.14, risk: 'high', radius: 45000, hazard: 'heat', region: 'Nevada', affectedProperties: 70, expectedLoss: 14000000 }
];

const riskColors = {
  high: '#d32f2f',
  medium: '#ed6c02',
  low: '#2e7d32'
};

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icon for risk levels
const createRiskMarkerIcon = (risk) => {
  return L.divIcon({
    className: `risk-marker ${risk}`,
    iconSize: [20, 20],
    html: `<div style="width: 20px; height: 20px; border-radius: 50%; background-color: ${riskColors[risk]}; border: 2px solid white;"></div>`
  });
};

const USRiskMap = ({ hazardType = 'all', timeframe = 2050, mapStyle = 'map' }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // US center coordinates
  const usCenter = [39.8283, -98.5795];
  const zoom = 4;

  const handleMarkerClick = (property) => {
    setSelectedProperty(property);
  };

  // Filter risk zones based on hazard type
  const filteredRiskZones = riskZones.filter(zone => {
    return hazardType === 'all' || zone.hazard === hazardType;
  }).map(zone => {
    // Adjust radius based on timeframe to simulate increasing risk
    let radiusMultiplier = 1;
    if (timeframe === 2050) radiusMultiplier = 1.5;
    if (timeframe === 2100) radiusMultiplier = 2.2;
    
    // Also adjust expected loss based on timeframe
    let lossMultiplier = 1;
    if (timeframe === 2050) lossMultiplier = 1.8;
    if (timeframe === 2100) lossMultiplier = 3.2;
    
    return {
      ...zone,
      radius: zone.radius * radiusMultiplier,
      expectedLoss: zone.expectedLoss * lossMultiplier,
      affectedProperties: Math.round(zone.affectedProperties * (1 + (radiusMultiplier - 1) * 0.7))
    };
  });

  // Map style URLs
  const mapStyles = {
    map: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    hybrid: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
  };

  // Get the appropriate tile layer URL based on mapStyle
  const tileLayerUrl = mapStyles[mapStyle] || mapStyles.map;
  const attribution = mapStyle === 'map' 
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    : '&copy; <a href="https://www.arcgis.com/">ArcGIS</a>';

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Box sx={{ height: 500, position: 'relative' }}>
      <MapContainer 
        center={usCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution={attribution}
          url={tileLayerUrl}
        />
        
        {/* Risk zone circles */}
        {filteredRiskZones.map(zone => (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{
              fillColor: riskColors[zone.risk],
              fillOpacity: 0.3,
              color: riskColors[zone.risk],
              opacity: 0.8
            }}
          >
            <Tooltip direction="center" permanent={false} sticky>
              <div>
                <strong>{zone.hazard.charAt(0).toUpperCase() + zone.hazard.slice(1)} Risk Zone - {zone.region}</strong><br />
                Risk Level: {zone.risk.toUpperCase()}<br />
                Affected Properties: {zone.affectedProperties}<br />
                Expected Loss: {formatCurrency(zone.expectedLoss)}
              </div>
            </Tooltip>
          </Circle>
        ))}
        
        {/* Property markers */}
        {sampleProperties.map(property => (
          <Marker
            key={property.id}
            position={[property.lat, property.lng]}
            icon={createRiskMarkerIcon(property.risk)}
            eventHandlers={{
              click: () => handleMarkerClick(property),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1.0}>
              {property.address}
            </Tooltip>
            {selectedProperty && selectedProperty.id === property.id && (
              <Popup>
                <Paper sx={{ p: 1, minWidth: 200 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Property Details
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {property.address}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Value: ${property.value.toLocaleString()}
                  </Typography>
                  <Chip 
                    label={`${property.risk.toUpperCase()} RISK`}
                    size="small"
                    sx={{ 
                      bgcolor: `${riskColors[property.risk]}`,
                      color: 'white',
                      mt: 1
                    }}
                  />
                </Paper>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
      
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 999,
          p: 1,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 1
        }}
      >
        <Typography variant="caption">
          {hazardType === 'all' ? 'All Hazards' : hazardType.charAt(0).toUpperCase() + hazardType.slice(1)} Risk Map - United States ({timeframe})
        </Typography>
      </Box>
    </Box>
  );
};

export default USRiskMap;