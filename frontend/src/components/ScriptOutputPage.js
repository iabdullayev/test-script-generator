// ScriptOutputPage.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, Typography, Box, Button } from '@mui/material';

function ScriptOutputPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const script = location.state?.script || '// No script generated';

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box 
      sx={{
        display: 'flex', 
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          mt: 4,
          width: '100%',
          maxWidth: 800,
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Generated Script
        </Typography>
        
        <Box 
          sx={{
            bgcolor: '#f5f5f5',
            p: 2,
            borderRadius: 1,
            my: 3,
            overflow: 'auto',
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {script}
          </pre>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleCopy}
            sx={{
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            Generate New Script
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default ScriptOutputPage;