import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';

const RiskMetricCard = ({ title, value, unit, progress, color, icon }) => {
  return (
    <Card
      component={motion.div}
      whileHover={{ 
        y: -5,
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
      }}
      transition={{ duration: 0.3 }}
      sx={{ height: '100%' }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Box 
            component={motion.div}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
            sx={{ 
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
        
        <Typography 
          variant="h4" 
          component={motion.h4}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {value}
          <Typography component="span" variant="body2" sx={{ ml: 0.5 }}>
            {unit}
          </Typography>
        </Typography>
        
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={color}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskMetricCard;