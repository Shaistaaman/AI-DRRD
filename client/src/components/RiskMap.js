import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from 'react-leaflet';
import { Box, Typography, Paper, Chip } from '@mui/material';
import L from 'leaflet';

// Sample data - in a real app, this would come from an API
const sampleProperties = [
  { id: 1, lat: 25.7617, lng: -80.1918, risk: 'high', value: 450000, address: '123 Ocean Dr, Miami, FL' },
  { id: 2, lat: 25.7827, lng: -80.2094, risk: 'medium', value: 320000, address: '456 Biscayne Blvd, Miami, FL' },
  { id: 3, lat: 25.7741, lng: -80.1936, risk: 'low', value: 275000, address: '789 Collins Ave, Miami, FL' },
  { id: 4, lat: 29.7604, lng: -95.3698, risk: 'high', value: 380000, address: '321 Main St, Houston, TX' },
  { id: 5, lat: 29.7633, lng: -95.3633, risk: 'medium', value: 290000, address: '654 Travis St, Houston, TX' },
  { id: 6, lat: 29.9511, lng: -90.0715, risk: 'high', value: 410000, address: '789 Canal St, New Orleans, LA' },
  { id: 7, lat: 40.7128, lng: -74.0060, risk: 'medium', value: 950000, address: '123 Broadway, New York, NY' },
  { id: 8, lat: 37.7749, lng: -122.4194, risk: 'low', value: 1250000, address: '456 Market St, San Francisco, CA' }
];

// Risk zone circles for visualization
const riskZones = [
  // Miami
  { id: 1, lat: 25.77, lng: -80.20, risk: 'high', radius: 500, hazard: 'flood', region: 'Miami', affectedProperties: 12, expectedLoss: 2500000 },
  { id: 2, lat: 25.76, lng: -80.21, risk: 'medium', radius: 700, hazard: 'flood', region: 'Miami', affectedProperties: 8, expectedLoss: 1200000 },
  { id: 3, lat: 25.78, lng: -80.19, risk: 'high', radius: 400, hazard: 'wind', region: 'Miami', affectedProperties: 10, expectedLoss: 1800000 },
  { id: 4, lat: 25.75, lng: -80.22, risk: 'medium', radius: 600, hazard: 'fire', region: 'Miami', affectedProperties: 6, expectedLoss: 950000 },
  { id: 5, lat: 25.79, lng: -80.18, risk: 'high', radius: 450, hazard: 'heat', region: 'Miami', affectedProperties: 9, expectedLoss: 1400000 },
  
  // Houston
  { id: 6, lat: 29.76, lng: -95.37, risk: 'high', radius: 600, hazard: 'flood', region: 'Houston', affectedProperties: 15, expectedLoss: 3200000 },
  { id: 7, lat: 29.75, lng: -95.38, risk: 'medium', radius: 800, hazard: 'wind', region: 'Houston', affectedProperties: 11, expectedLoss: 1700000 },
  { id: 8, lat: 29.77, lng: -95.36, risk: 'high', radius: 500, hazard: 'fire', region: 'Houston', affectedProperties: 8, expectedLoss: 2100000 },
  { id: 9, lat: 29.74, lng: -95.39, risk: 'medium', radius: 700, hazard: 'heat', region: 'Houston', affectedProperties: 7, expectedLoss: 1100000 },
  
  // New Orleans
  { id: 10, lat: 29.95, lng: -90.07, risk: 'high', radius: 550, hazard: 'flood', region: 'NewOrleans', affectedProperties: 14, expectedLoss: 2800000 },
  { id: 11, lat: 29.96, lng: -90.06, risk: 'medium', radius: 650, hazard: 'wind', region: 'NewOrleans', affectedProperties: 9, expectedLoss: 1500000 },
  
  // New York
  { id: 12, lat: 40.71, lng: -74.00, risk: 'medium', radius: 500, hazard: 'flood', region: 'NewYork', affectedProperties: 18, expectedLoss: 4200000 },
  { id: 13, lat: 40.72, lng: -73.99, risk: 'high', radius: 450, hazard: 'wind', region: 'NewYork', affectedProperties: 12, expectedLoss: 3800000 },
  
  // San Francisco
  { id: 14, lat: 37.77, lng: -122.41, risk: 'low', radius: 400, hazard: 'fire', region: 'SanFrancisco', affectedProperties: 6, expectedLoss: 1900000 },
  { id: 15, lat: 37.78, lng: -122.40, risk: 'medium', radius: 500, hazard: 'flood', region: 'SanFrancisco', affectedProperties: 10, expectedLoss: 2700000 }
];

const riskColors = {
  high: '#d32f2f',
  medium: '#ed6c02',
  low: '#2e7d32'
};

// Map center coordinates for each region
const regionCoordinates = {
  Miami: [25.7617, -80.1918],
  Houston: [29.7604, -95.3698],
  NewOrleans: [29.9511, -90.0715],
  NewYork: [40.7128, -74.0060],
  SanFrancisco: [37.7749, -122.4194]
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

// Map recenter component
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Map style URLs
const mapStyles = {
  map: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  hybrid: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
};

const RiskMap = ({ hazardType = 'flood', region = 'Miami', timeframe = 2050, mapStyle = 'map' }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapCenter, setMapCenter] = useState(regionCoordinates[region] || [25.7617, -80.1918]);
  const [zoom, setZoom] = useState(12);
  const mapRef = useRef(null);
  
  // Change view based on region
  useEffect(() => {
    if (regionCoordinates[region]) {
      setMapCenter(regionCoordinates[region]);
    }
  }, [region]);

  const handleMarkerClick = (property) => {
    setSelectedProperty(property);
  };

  // Filter properties based on region
  const filteredProperties = sampleProperties.filter(property => {
    if (region === 'Miami') {
      return property.address.includes('Miami');
    } else if (region === 'Houston') {
      return property.address.includes('Houston');
    } else if (region === 'NewOrleans') {
      return property.address.includes('New Orleans');
    } else if (region === 'NewYork') {
      return property.address.includes('New York');
    } else if (region === 'SanFrancisco') {
      return property.address.includes('San Francisco');
    }
    return true;
  });

  // Filter risk zones based on region, hazard type and timeframe
  const filteredRiskZones = riskZones.filter(zone => {
    // Basic filtering by region and hazard type
    const regionMatch = zone.region === region;
    const hazardMatch = zone.hazard === hazardType;
    
    // For timeframe, we'll simulate increasing risk radius based on future projections
    // This is just for demo purposes - in a real app, you'd have different data for each timeframe
    return regionMatch && hazardMatch;
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
        center={mapCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        ref={mapRef}
      >
        <ChangeView center={mapCenter} zoom={zoom} />
        
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
                <strong>{zone.hazard.charAt(0).toUpperCase() + zone.hazard.slice(1)} Risk Zone</strong><br />
                Risk Level: {zone.risk.toUpperCase()}<br />
                Affected Properties: {zone.affectedProperties}<br />
                Expected Loss: {formatCurrency(zone.expectedLoss)}
              </div>
            </Tooltip>
          </Circle>
        ))}
        
        {/* Property markers */}
        {filteredProperties.map(property => (
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
          {hazardType.charAt(0).toUpperCase() + hazardType.slice(1)} Risk Map - {region.replace(/([A-Z])/g, ' $1').trim()} ({timeframe})
        </Typography>
      </Box>
    </Box>
  );
};

export default RiskMap;