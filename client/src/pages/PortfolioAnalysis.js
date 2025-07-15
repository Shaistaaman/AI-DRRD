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
  Button,
  Pagination,
  Stack
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import GetAppIcon from '@mui/icons-material/GetApp';

// Components
import RiskChart from '../components/RiskChart';

// API service functions
const fetchPortfolioSummary = async () => {
  const response = await fetch('/api/portfolio');
  if (!response.ok) throw new Error('Failed to fetch portfolio summary');
  return response.json();
};

const fetchPortfolioLoans = async () => {
  const response = await fetch('/api/portfolio/loans');
  if (!response.ok) throw new Error('Failed to fetch portfolio loans');
  return response.json();
};

const PortfolioAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loans, setLoans] = useState([]);
  const [portfolioData, setPortfolioData] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50);

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both portfolio summary and loan details
        const [summaryData, loansData] = await Promise.all([
          fetchPortfolioSummary(),
          fetchPortfolioLoans()
        ]);

        setPortfolioData(summaryData);
        setLoans(loansData);
      } catch (err) {
        console.error('Error loading portfolio data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioData();
  }, []);

  // Filter loans based on search term
  const filteredLoans = React.useMemo(() => {
    if (!searchTerm.trim()) return loans;

    const filtered = loans.filter(loan =>
      loan.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.risk?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered;
  }, [loans, searchTerm]);

  // Reset pagination when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLoans.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedLoans = filteredLoans.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  // Export functionality
  const handleExport = () => {
    const csvHeaders = [
      'Loan ID',
      'Property Address',
      'Value',
      'LTV',
      'Risk Level',
      'Credit Score',
      'Loan Age',
      'Interest Rate',
      'DTI',
      'Delinquency Status',
      'State'
    ];

    const csvData = filteredLoans.map(loan => [
      loan.id,
      loan.address,
      loan.value,
      (loan.ltv * 100).toFixed(1) + '%',
      loan.risk,
      loan.creditScore || 'N/A',
      (loan.loanAge || 0) + ' months',
      loan.interestRate ? loan.interestRate.toFixed(2) + '%' : 'N/A',
      loan.dti ? loan.dti.toFixed(1) + '%' : 'N/A',
      loan.delinquencyStatus === 0 ? 'Current' : loan.delinquencyStatus + ' days',
      loan.state
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `portfolio_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  // Calculate risk distribution from loans data
  const riskDistributionData = React.useMemo(() => {
    if (!loans.length) return [];

    const riskCounts = loans.reduce((acc, loan) => {
      acc[loan.risk] = (acc[loan.risk] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Low Risk', value: riskCounts.low || 0 },
      { name: 'Medium Risk', value: riskCounts.medium || 0 },
      { name: 'High Risk', value: riskCounts.high || 0 }
    ];
  }, [loans]);

  // Calculate regional distribution from loans data
  const regionalDistributionData = React.useMemo(() => {
    if (!loans.length) return [];

    const stateData = loans.reduce((acc, loan) => {
      const state = loan.state || 'Unknown';
      if (!acc[state]) {
        acc[state] = { name: state, value: 0, count: 0 };
      }
      acc[state].value += loan.value;
      acc[state].count += 1;
      return acc;
    }, {});

    return Object.values(stateData).map(state => ({
      name: state.name,
      value: Math.round(state.value / 1000000) // Convert to millions
    }));
  }, [loans]);

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
                      onClick={handleExport}
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
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Loading portfolio data...
                    </Typography>
                  </Box>
                ) : error ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Typography variant="body2" color="error">
                      Error: {error}
                    </Typography>
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
                          <TableCell align="right">Credit Score</TableCell>
                          <TableCell align="right">Loan Age</TableCell>
                          <TableCell align="right">Interest Rate</TableCell>
                          <TableCell align="right">DTI</TableCell>
                          <TableCell align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedLoans.map((loan) => (
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
                            <TableCell align="right">{loan.creditScore || 'N/A'}</TableCell>
                            <TableCell align="right">{loan.loanAge || 0} months</TableCell>
                            <TableCell align="right">{loan.interestRate ? `${loan.interestRate.toFixed(2)}%` : 'N/A'}</TableCell>
                            <TableCell align="right">{loan.dti ? `${loan.dti.toFixed(1)}%` : 'N/A'}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={loan.delinquencyStatus === 0 ? 'Current' : `${loan.delinquencyStatus} days`}
                                color={loan.delinquencyStatus === 0 ? 'success' : loan.delinquencyStatus <= 30 ? 'warning' : 'error'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Pagination Controls */}
                {!loading && !error && filteredLoans.length > 0 && (
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredLoans.length)} of {filteredLoans.length} loans
                      {searchTerm && ` (filtered from ${loans.length} total)`}
                    </Typography>

                    <Stack spacing={2}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                        siblingCount={2}
                        boundaryCount={1}
                      />
                    </Stack>
                  </Box>
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