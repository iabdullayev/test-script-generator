import React from 'react';
import { Paper, Typography, LinearProgress, Box } from '@mui/material';
import './AIProcessingStatus.css';

const AIProcessingStatus = ({ status, progress }) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'analyzing':
        return 'Analyzing screenshot with Computer Vision AI...';
      case 'generating':
        return 'Generating test script with GPT-4...';
      case 'formatting':
        return 'Formatting and optimizing the script...';
      default:
        return 'Preparing...';
    }
  };

  return (
    <Paper className="ai-status-container" elevation={3}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          AI Processing Status
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {getStatusMessage()}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ mt: 2 }}
        />
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          {progress}% Complete
        </Typography>
      </Box>
    </Paper>
  );
};

export default AIProcessingStatus;