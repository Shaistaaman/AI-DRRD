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
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import GetAppIcon from '@mui/icons-material/GetApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';

// Sample data
const sampleReports = [
  { 
    id: 'R001', 
    name: 'Q3 2023 Portfolio Risk Assessment', 
    date: '2023-10-15T14:30:00Z',
    type: 'quarterly',
    format: 'pdf',
    size: '2.4 MB'
  },
  { 
    id: 'R002', 
    name: 'Hurricane Ian Impact Analysis', 
    date: '2023-09-28T09:15:00Z',
    type: 'event',
    format: 'xlsx',
    size: '1.8 MB'
  },
  { 
    id: 'R003', 
    name: 'California Wildfire Exposure', 
    date: '2023-08-12T16:45:00Z',
    type: 'analysis',
    format: 'pdf',
    size: '3.2 MB'
  },
  { 
    id: 'R004', 
    name: 'Flood Risk Stress Test', 
    date: '2023-07-05T11:20:00Z',
    type: 'stress-test',
    format: 'json',
    size: '0.9 MB'
  },
  { 
    id: 'R005', 
    name: 'Annual Climate Risk Disclosure', 
    date: '2023-06-30T15:00:00Z',
    type: 'regulatory',
    format: 'pdf',
    size: '5.7 MB'
  },
  { 
    id: 'R006', 
    name: 'Mortgage Portfolio Heat Exposure', 
    date: '2023-05-22T10:30:00Z',
    type: 'analysis',
    format: 'xlsx',
    size: '2.1 MB'
  },
  { 
    id: 'R007', 
    name: 'Q2 2023 Portfolio Risk Assessment', 
    date: '2023-04-15T13:45:00Z',
    type: 'quarterly',
    format: 'pdf',
    size: '2.3 MB'
  }
];

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setReports(sampleReports);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const filteredReports = reports.filter(report => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const getTypeColor = (type) => {
    switch (type) {
      case 'quarterly': return 'primary';
      case 'event': return 'error';
      case 'analysis': return 'info';
      case 'stress-test': return 'warning';
      case 'regulatory': return 'secondary';
      default: return 'default';
    }
  };
  
  const getFormatIcon = (format) => {
    switch (format) {
      case 'pdf': return '📄';
      case 'xlsx': return '📊';
      case 'json': return '📋';
      default: return '📁';
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Reports
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Generated Reports
                  </Typography>
                  
                  <Button 
                    variant="contained"
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Generate New Report
                  </Button>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Search reports by name, ID, or type"
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
                          <TableCell>Report ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Format</TableCell>
                          <TableCell>Size</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <AnimatePresence>
                          {filteredReports.map((report) => (
                            <TableRow
                              key={report.id}
                              component={motion.tr}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
                              sx={{ cursor: 'pointer' }}
                            >
                              <TableCell>{report.id}</TableCell>
                              <TableCell>{report.name}</TableCell>
                              <TableCell>{formatDate(report.date)}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={report.type.toUpperCase()} 
                                  color={getTypeColor(report.type)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography sx={{ mr: 1 }}>{getFormatIcon(report.format)}</Typography>
                                  {report.format.toUpperCase()}
                                </Box>
                              </TableCell>
                              <TableCell>{report.size}</TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                  <IconButton 
                                    size="small"
                                    onClick={() => handleViewReport(report)}
                                    component={motion.button}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small"
                                    component={motion.button}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <GetAppIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small"
                                    component={motion.button}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <ShareIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small"
                                    component={motion.button}
                                    whileHover={{ scale: 1.2, color: '#f44336' }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
      
      {/* Report Preview Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedReport && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedReport.name}</Typography>
                <Chip 
                  label={selectedReport.type.toUpperCase()} 
                  color={getTypeColor(selectedReport.type)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Preview" />
                  <Tab label="Metadata" />
                  <Tab label="Share" />
                </Tabs>
              </Box>
              
              {tabValue === 0 && (
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, minHeight: 400 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Report preview for {selectedReport.name}
                  </Typography>
                  
                  <Box 
                    component="img"
                    src="https://via.placeholder.com/800x400?text=Report+Preview"
                    alt="Report Preview"
                    sx={{ width: '100%', borderRadius: 1 }}
                  />
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Report ID</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedReport.id}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Created</Typography>
                      <Typography variant="body2" color="text.secondary">{formatDate(selectedReport.date)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Format</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedReport.format.toUpperCase()}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Size</Typography>
                      <Typography variant="body2" color="text.secondary">{selectedReport.size}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Description</Typography>
                      <Typography variant="body2" color="text.secondary">
                        This report provides an analysis of climate-related physical risks for the mortgage portfolio.
                        It includes risk metrics, exposure analysis, and recommendations for risk mitigation.
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Share Report</Typography>
                  <TextField
                    fullWidth
                    label="Email Recipients"
                    placeholder="Enter email addresses separated by commas"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Message"
                    placeholder="Add a message (optional)"
                    variant="outlined"
                    multiline
                    rows={4}
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button 
                variant="contained" 
                startIcon={<GetAppIcon />}
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Download
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Reports;