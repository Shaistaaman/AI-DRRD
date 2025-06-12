import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import GetAppIcon from '@mui/icons-material/GetApp';

// Components
import RiskChart from '../components/RiskChart';

// Sample data
const portfolioData = {
  totalLoans: 1250,
  totalValue: 375000000,
  averageLTV: 0.72,
  riskCategories: {
    low: 450,
    medium: 600,
    high: 200
  },
  regions: [
    { name: 'Northeast', count: 300, value: 95000000 },
    { name: 'Southeast', count: 450, value: 125000000 },
    { name: 'Midwest', count: 200, value: 55000000 },
    { name: 'Southwest', count: 150, value: 45000000 },
    { name: 'West', count: 150, value: 55000000 }
  ]
};

const sampleLoans = [
  { id: 'L001', address: '123 Ocean Dr, Miami, FL', value: 450000, ltv: 0.68, risk: 'high' },
  { id: 'L002', address: '456 Biscayne Blvd, Miami, FL', value: 320000, ltv: 0.72, risk: 'medium' },
  { id: 'L003', address: '789 Collins Ave, Miami, FL', value: 275000, ltv: 0.65, risk: 'low' },
  { id: 'L004', address: '321 Main St, Houston, TX', value: 380000, ltv: 0.75, risk: 'high' },
  { id: 'L005', address: '654 Travis St, Houston, TX', value: 290000, ltv: 0.70, risk: 'medium' },
  { id: 'L006', address: '987 Market St, San Francisco, CA', value: 850000, ltv: 0.80, risk: 'medium' },
  { id: 'L007', address: '543 Pine St, Seattle, WA', value: 520000, ltv: 0.75, risk: 'low' },
  { id: 'L008', address: '876 Broadway, New York, NY', value: 920000, ltv: 0.78, risk: 'medium' },
  { id: 'L009', address: '234 Michigan Ave, Chicago, IL', value: 410000, ltv: 0.72, risk: 'low' },
  { id: 'L010', address: '567 Peachtree St, Atlanta, GA', value: 350000, ltv: 0.71, risk: 'high' }
];

const PortfolioAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loans, setLoans] = useState([]);
  
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoans(sampleLoans);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const filteredLoans = loans.filter(loan => 
    loan.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
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
  
  const riskDistributionData = [
    { name: 'Low Risk', value: portfolioData.riskCategories.low },
    { name: 'Medium Risk', value: portfolioData.riskCategories.medium },
    { name: 'High Risk', value: portfolioData.riskCategories.high }
  ];
  
  const regionalDistributionData = portfolioData.regions.map(region => ({
    name: region.name,
    value: region.value / 1000000 // Convert to millions
  }));

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Portfolio Analysis
      </Typography>
      
      <Grid container spacing={3}>
        {/* Portfolio Overview */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RiskChart 
              type="pie"
              data={riskDistributionData}
              title="Risk Distribution"
              height={300}
            />
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <RiskChart 
              type="bar"
              data={regionalDistributionData}
              title="Regional Distribution ($M)"
              height={300}
            />
          </motion.div>
        </Grid>
        
        {/* Loan Table */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Loan Portfolio
                  </Typography>
                  
                  <Box>
                    <Button 
                      startIcon={<GetAppIcon />}
                      variant="outlined"
                      size="small"
                      sx={{ ml: 1 }}
                      component={motion.button}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Export
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Search by loan ID or address"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: 'flex' }}>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <FilterListIcon sx={{ cursor: 'pointer', mr: 1 }} />
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <SortIcon sx={{ cursor: 'pointer' }} />
                            </motion.div>
                          </Box>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Loan ID</TableCell>
                          <TableCell>Property Address</TableCell>
                          <TableCell align="right">Value</TableCell>
                          <TableCell align="right">LTV</TableCell>
                          <TableCell align="center">Risk Level</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredLoans.map((loan) => (
                          <TableRow
                            key={loan.id}
                            component={motion.tr}
                            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{loan.id}</TableCell>
                            <TableCell>{loan.address}</TableCell>
                            <TableCell align="right">{formatCurrency(loan.value)}</TableCell>
                            <TableCell align="right">{(loan.ltv * 100).toFixed(1)}%</TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={loan.risk.toUpperCase()} 
                                color={getRiskColor(loan.risk)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PortfolioAnalysis;