import axios from 'axios';

// Using OpenWeatherMap API which has a free tier
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getWeatherByCoordinates = async (lat, lon) => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

export const getWeatherForecast = async (lat, lon) => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
};

// For demo purposes, we'll use a mock API that doesn't require an API key
export const getMockWeatherData = async (region) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data based on region
  const mockData = {
    Miami: {
      weather: { main: 'Rain', description: 'heavy rain', icon: '10d' },
      main: { temp: 28, humidity: 85 },
      wind: { speed: 15, deg: 180 },
      rain: { '1h': 25 },
      alerts: [{ event: 'Flood', description: 'Flash flood warning in effect' }]
    },
    Houston: {
      weather: { main: 'Thunderstorm', description: 'thunderstorm with heavy rain', icon: '11d' },
      main: { temp: 30, humidity: 80 },
      wind: { speed: 20, deg: 220 },
      rain: { '1h': 30 },
      alerts: [{ event: 'Severe Thunderstorm', description: 'Severe thunderstorm warning in effect' }]
    },
    NewYork: {
      weather: { main: 'Clear', description: 'clear sky', icon: '01d' },
      main: { temp: 22, humidity: 60 },
      wind: { speed: 8, deg: 270 }
    },
    SanFrancisco: {
      weather: { main: 'Fog', description: 'fog', icon: '50d' },
      main: { temp: 18, humidity: 75 },
      wind: { speed: 12, deg: 290 }
    },
    NewOrleans: {
      weather: { main: 'Rain', description: 'moderate rain', icon: '10d' },
      main: { temp: 29, humidity: 82 },
      wind: { speed: 18, deg: 200 },
      rain: { '1h': 15 }
    }
  };
  
  return mockData[region] || mockData.Miami;
};

// Calculate expected loss based on weather conditions
export const calculateWeatherRisk = (weatherData, propertyValue) => {
  let riskFactor = 0;
  
  // Base risk factors
  if (weatherData.weather.main === 'Rain') {
    riskFactor += 0.05; // 5% base risk for rain
    
    // Additional risk based on rain intensity
    if (weatherData.rain && weatherData.rain['1h']) {
      const rainAmount = weatherData.rain['1h'];
      if (rainAmount > 20) riskFactor += 0.15; // Heavy rain
      else if (rainAmount > 10) riskFactor += 0.08; // Moderate rain
      else riskFactor += 0.03; // Light rain
    }
  }
  
  if (weatherData.weather.main === 'Thunderstorm') {
    riskFactor += 0.12; // 12% base risk for thunderstorms
  }
  
  // Wind risk
  if (weatherData.wind && weatherData.wind.speed) {
    const windSpeed = weatherData.wind.speed;
    if (windSpeed > 18) riskFactor += 0.10; // High wind
    else if (windSpeed > 10) riskFactor += 0.05; // Moderate wind
  }
  
  // Alerts increase risk
  if (weatherData.alerts && weatherData.alerts.length > 0) {
    weatherData.alerts.forEach(alert => {
      if (alert.event.includes('Flood')) riskFactor += 0.20;
      if (alert.event.includes('Hurricane')) riskFactor += 0.30;
      if (alert.event.includes('Tornado')) riskFactor += 0.25;
      if (alert.event.includes('Storm')) riskFactor += 0.15;
    });
  }
  
  // Calculate expected loss
  const expectedLoss = propertyValue * riskFactor;
  
  return {
    riskFactor,
    expectedLoss,
    riskLevel: riskFactor > 0.2 ? 'high' : riskFactor > 0.1 ? 'medium' : 'low'
  };
};