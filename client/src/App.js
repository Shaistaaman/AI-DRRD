import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { AnimatePresence } from 'framer-motion';

// Layout components
import Layout from './components/Layout';
import AIAssistant from './components/AIAssistant';

// Pages
import Dashboard from './pages/Dashboard';
import PortfolioAnalysis from './pages/PortfolioAnalysis';
import PortfolioUpload from './pages/PortfolioUpload';
import RiskMap from './pages/RiskMap';
import ScenarioBuilder from './pages/ScenarioBuilder';
import Reports from './pages/Reports';
import WeatherRiskPage from './pages/WeatherRiskPage';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <Layout>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<PortfolioAnalysis />} />
              <Route path="/portfolio-upload" element={<PortfolioUpload />} />
              <Route path="/risk-map" element={<RiskMap />} />
              <Route path="/weather-risk" element={<WeatherRiskPage />} />
              <Route path="/scenario-builder" element={<ScenarioBuilder />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </AnimatePresence>
        </Layout>
        <AIAssistant />
      </Box>
    </Router>
  );
}

export default App;