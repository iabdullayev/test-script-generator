import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAIProcessing } from '../../context/AIProcessingContext';

function ProcessingIndicator() {
  const { processingState } = useAIProcessing();
  
  if (!processingState.isProcessing) return null;

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      mt: 4 
    }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>
        {processingState.stage === 'analyzing' 
          ? 'Analyzing screenshot...' 
          : 'Generating script...'}
      </Typography>
    </Box>
  );
}

export default ProcessingIndicator;