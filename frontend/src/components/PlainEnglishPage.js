import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress
} from '@mui/material';

function PlainEnglishPage() {
  const [scenario, setScenario] = useState('');
  const [framework, setFramework] = useState('XCUITest');
  const [loading, setLoading] = useState(false);
  const [scriptResult, setScriptResult] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setScriptResult('');

    try {
      // POST to /api/plain-english
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/plain-english`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenario, framework }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate script: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Generation failed');
      }

      setScriptResult(data.script);
    } catch (error) {
      setErrorMessage(error.message);
      console.error('Plain-English generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: '60vh',
        py: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 800,
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(5px)',
          borderRadius: 4,
          margin: '0 auto',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Generate Script From Plain English
        </Typography>

        <form onSubmit={handleGenerate}>
          {/* Scenario Input */}
          <TextField
            label="Scenario (Plain English)"
            placeholder='e.g. "Open the app, log in with user@example.com, verify home screen."'
            multiline
            rows={4}
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            required
            fullWidth
            margin="normal"
          />

          {/* Framework Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="framework-label">Framework</InputLabel>
            <Select
              labelId="framework-label"
              value={framework}
              label="Framework"
              onChange={(e) => setFramework(e.target.value)}
            >
              <MenuItem value="XCUITest">XCUITest (iOS)</MenuItem>
              <MenuItem value="Espresso">Espresso (Android)</MenuItem>
              <MenuItem value="Playwright">Playwright (Web)</MenuItem>
            </Select>
          </FormControl>

          {/* Generate Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Script'}
          </Button>
        </form>

        {/* Error Message */}
        {errorMessage && (
          <Typography color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}

        {/* Display Result */}
        {scriptResult && (
          <Box
            sx={{
              mt: 4,
              p: 2,
              bgcolor: '#f5f5f5',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Generated Script:
            </Typography>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {scriptResult}
            </pre>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default PlainEnglishPage;