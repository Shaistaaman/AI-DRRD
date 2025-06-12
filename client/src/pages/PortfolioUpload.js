import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  TextField,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const PortfolioUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setUploadStatus(null);
  };
  
  const handleUpload = () => {
    if (!file) return;
    
    setUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setUploading(false);
      setUploadStatus({
        success: true,
        message: 'Portfolio data uploaded successfully!',
        details: {
          loansProcessed: 1250,
          validLoans: 1242,
          invalidLoans: 8,
          totalValue: '$375,000,000'
        }
      });
    }, 2000);
  };
  
  const handleDragOver = (event) => {
    event.preventDefault();
  };
  
  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
    setUploadStatus(null);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Upload Portfolio
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upload Mortgage Portfolio Data
                </Typography>
                
                <Box 
                  sx={{ 
                    border: '2px dashed #ccc', 
                    borderRadius: 2, 
                    p: 3, 
                    textAlign: 'center',
                    bgcolor: 'background.default',
                    mb: 3
                  }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  component={motion.div}
                  whileHover={{ borderColor: '#1976d2' }}
                >
                  <input
                    type="file"
                    accept=".csv,.xlsx,.json"
                    style={{ display: 'none' }}
                    id="portfolio-file-upload"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="portfolio-file-upload">
                    <Button
                      component="span"
                      variant="contained"
                      startIcon={<UploadFileIcon />}
                      sx={{ mb: 2 }}
                    >
                      Select File
                    </Button>
                  </label>
                  
                  <Typography variant="body2" color="text.secondary">
                    or drag and drop file here
                  </Typography>
                  
                  {file && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
                      <Typography variant="body2">
                        Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: CSV, Excel, JSON
                  </Typography>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!file || uploading}
                    onClick={handleUpload}
                    startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  >
                    {uploading ? 'Uploading...' : 'Upload Portfolio'}
                  </Button>
                </Box>
                
                {uploadStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Alert 
                      severity={uploadStatus.success ? "success" : "error"}
                      sx={{ mt: 3 }}
                    >
                      {uploadStatus.message}
                    </Alert>
                    
                    {uploadStatus.success && uploadStatus.details && (
                      <Paper sx={{ mt: 2, p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Upload Summary
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Loans Processed
                            </Typography>
                            <Typography variant="body1">
                              {uploadStatus.details.loansProcessed}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Total Portfolio Value
                            </Typography>
                            <Typography variant="body1">
                              {uploadStatus.details.totalValue}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Valid Loans
                            </Typography>
                            <Typography variant="body1" color="success.main">
                              {uploadStatus.details.validLoans}
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Invalid Loans
                            </Typography>
                            <Typography variant="body1" color="error.main">
                              {uploadStatus.details.invalidLoans}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button variant="outlined" size="small">
                            View Details
                          </Button>
                        </Box>
                      </Paper>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  File Requirements
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="CSV, Excel, or JSON format" 
                      secondary="Make sure your file is in one of these formats"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Required columns" 
                      secondary="Loan ID, Property Address, Value, Balance, LTV, Coordinates"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Maximum file size" 
                      secondary="50MB maximum file size"
                    />
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Sample Data Format
                </Typography>
                
                <Box sx={{ 
                  p: 1, 
                  bgcolor: 'background.default', 
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  overflowX: 'auto'
                }}>
                  <pre style={{ margin: 0 }}>
{`id,address,value,balance,ltv,lat,lng
L001,123 Main St,450000,306000,0.68,25.7617,-80.1918
L002,456 Oak Ave,320000,230400,0.72,25.7827,-80.2094
...`}
                  </pre>
                </Box>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  What Happens Next?
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Data Validation" 
                      secondary="We'll check your data for completeness and accuracy"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Risk Assessment" 
                      secondary="Properties will be analyzed for climate risk exposure"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Portfolio Dashboard" 
                      secondary="Your portfolio will be available in the dashboard"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Weather Risk Analysis" 
                      secondary="Current weather conditions will be applied to assess immediate risks"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PortfolioUpload;