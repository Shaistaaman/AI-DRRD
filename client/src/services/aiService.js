import axios from 'axios';
import { getMockWeatherData, calculateWeatherRisk } from './weatherService';
import { getLoansByRegion, getMockPortfolioData } from './portfolioService';

// In a real implementation, this would connect to GooseAI or another LLM API
// For demo purposes, we'll use a mock implementation

// Sample prompts and responses for common questions
const knowledgeBase = {
  'portfolio risk': 'Your portfolio has properties across multiple regions with varying risk levels. The highest risk areas are currently in Miami and Houston due to flood and hurricane threats.',
  'weather forecast': 'Current weather forecasts show increased precipitation in coastal areas, with potential storm systems developing in the Southeast region.',
  'risk mitigation': 'To mitigate risks, consider diversifying your portfolio across different geographical regions and investing in properties with climate-resilient features.',
  'property value': 'Property values in high-risk areas may experience volatility due to increasing insurance costs and climate-related concerns.',
  'insurance': 'Insurance premiums for properties in high-risk flood zones have increased by an average of 12% in the past year.',
  'climate change': 'Climate models project increased frequency and severity of extreme weather events, particularly in coastal and wildfire-prone regions.'
};

// Mock AI response generation
const generateResponse = async (query, portfolioData = null, region = null) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Convert query to lowercase for matching
  const queryLower = query.toLowerCase();
  
  // Get portfolio data if not provided
  if (!portfolioData) {
    portfolioData = getMockPortfolioData();
  }
  
  // Prepare a response based on the query
  let response = '';
  
  // Check for specific question types
  if (queryLower.includes('portfolio') && queryLower.includes('risk')) {
    const highRiskCount = portfolioData.riskCategories.high;
    const totalLoans = portfolioData.totalLoans;
    const highRiskPercentage = ((highRiskCount / totalLoans) * 100).toFixed(1);
    
    response = `Your portfolio currently has ${highRiskCount} high-risk properties out of ${totalLoans} total loans (${highRiskPercentage}%). The highest concentration of risk is in the Southeast region, primarily due to flood and hurricane exposure.`;
  }
  else if (queryLower.includes('weather') && region) {
    const weatherData = await getMockWeatherData(region);
    response = `Current weather in ${region.replace(/([A-Z])/g, ' $1').trim()} shows ${weatherData.weather.description} with temperatures around ${weatherData.main.temp}°C. `;
    
    if (weatherData.alerts) {
      response += `There are active weather alerts: ${weatherData.alerts.map(a => a.event).join(', ')}.`;
    }
  }
  else if (queryLower.includes('expected loss') || queryLower.includes('financial impact')) {
    const totalValue = portfolioData.totalValue;
    const estimatedLoss = totalValue * 0.08; // 8% estimated loss for demo purposes
    
    response = `Based on current risk assessments, the estimated potential loss across your portfolio is approximately $${(estimatedLoss / 1000000).toFixed(1)} million, which represents about 8% of your total portfolio value.`;
  }
  else if (queryLower.includes('recommend') || queryLower.includes('suggest') || queryLower.includes('advice')) {
    response = `I recommend focusing on risk mitigation for your Southeast properties, particularly in Miami and Houston. Consider increasing insurance coverage for these properties and investing in flood protection measures. Additionally, future acquisitions should prioritize regions with lower climate risk profiles.`;
  }
  else if (queryLower.includes('region') && queryLower.includes('risk')) {
    response = `The Southeast region has the highest risk exposure in your portfolio, with $125M in property value. This is followed by the Northeast ($95M) and Midwest ($55M). The Southeast is particularly vulnerable to hurricanes and flooding.`;
  }
  else {
    // Generic response using knowledge base
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (queryLower.includes(key)) {
        response = value;
        break;
      }
    }
    
    // Fallback response
    if (!response) {
      response = "I can help you analyze your portfolio's climate risk exposure, provide weather insights, and recommend risk mitigation strategies. Could you please clarify what specific information you're looking for?";
    }
  }
  
  return {
    text: response,
    timestamp: new Date().toISOString()
  };
};

// Speech synthesis for voice responses
const speakResponse = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
    return true;
  }
  return false;
};

// Speech recognition for voice input
const startVoiceRecognition = (onResult, onError) => {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    
    recognition.onerror = (event) => {
      if (onError) onError(event.error);
    };
    
    recognition.start();
    return recognition;
  }
  
  if (onError) onError('Speech recognition not supported');
  return null;
};

export { generateResponse, speakResponse, startVoiceRecognition };