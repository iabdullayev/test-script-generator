import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import HomePage from './components/HomePage';
import ScriptOutputPage from './components/ScriptOutputPage';
import PlainEnglishPage from './components/PlainEnglishPage';
import { AIProcessingProvider } from './context/AIProcessingContext';

function App() {
  return (
    <AIProcessingProvider>
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          overflow: 'hidden',
          background: 'linear-gradient(to right, #b39ddb, #80cbc4)',
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            position: 'relative',
            zIndex: 1,
            py: 4,
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/output" element={<ScriptOutputPage />} />
            <Route path="/plain-english" element={<PlainEnglishPage />} />
          </Routes>
        </Container>
      </Box>
    </AIProcessingProvider>
  );
}

export default App;