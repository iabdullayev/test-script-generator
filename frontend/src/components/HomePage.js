// HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAIProcessing } from '../context/AIProcessingContext';

// List of all XCUIElement types
const xcuiElementTypes = [
  { value: "button", label: "Button" },
  { value: "textField", label: "Text Field" },
  { value: "staticText", label: "Label" },
  { value: "switch", label: "Switch" },
  { value: "slider", label: "Slider" },
  { value: "stepper", label: "Stepper" },
  { value: "image", label: "Image" },
  { value: "link", label: "Link" },
  { value: "segmentedControl", label: "Segmented Control" },
  { value: "picker", label: "Picker" },
  { value: "datePicker", label: "Date Picker" },
  { value: "scrollView", label: "Scroll View" },
  { value: "tableView", label: "Table View" },
  { value: "collectionView", label: "Collection View" },
  { value: "tabBar", label: "Tab Bar" },
  { value: "toolbar", label: "Toolbar" },
  { value: "navigationBar", label: "Navigation Bar" },
  { value: "activityIndicator", label: "Activity Indicator" },
  { value: "progressIndicator", label: "Progress Indicator" },
  { value: "pageControl", label: "Page Control" },
];

function HomePage() {
  const navigate = useNavigate();
  const { processingState, updateProcessingState } = useAIProcessing();

  const [framework, setFramework] = useState('');
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState('');
  const [useCase, setUseCase] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [uiElements, setUiElements] = useState([]);
  const [newElement, setNewElement] = useState({
    name: '',
    type: 'button',
    identifier: ''
  });

  // Fetch patterns when framework changes
  useEffect(() => {
    if (framework) {
      fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/patterns/${framework}`
      )
        .then(res => res.json())
        .then(data => setPatterns(data))
        .catch(console.error);
    }
  }, [framework]);

  const handleAddElement = () => {
    if (newElement.name && newElement.type) {
      const suffix = getSuffix(newElement.type);
      const elementName = newElement.name.replace(/\s+/g, '') + suffix;
      
      setUiElements([...uiElements, {
        ...newElement,
        id: Date.now(),
        caseName: elementName
      }]);
      
      setNewElement({
        name: '',
        type: 'button',
        identifier: ''
      });
    }
  };

  const getSuffix = (type) => {
    switch (type) {
      case 'button':
        return 'Btn';
      case 'textField':
        return 'Txt';
      case 'staticText':
        return 'Lbl';
      default:
        return '';
    }
  };

  const handleRemoveElement = (id) => {
    setUiElements(uiElements.filter(element => element.id !== id));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setScreenshot(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      updateProcessingState({ isProcessing: true, stage: 'analyzing', error: null });
      
      const formData = new FormData();
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }
      formData.append('framework', framework);
      formData.append('useCase', useCase);
      formData.append('pattern', selectedPattern);
      if (uiElements.length > 0) {
        formData.append('predefinedElements', JSON.stringify(uiElements));
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/generate`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      updateProcessingState({ isProcessing: false, stage: 'complete' });
      
      navigate('/output', { 
        state: { script: result.script }
      });
    } catch (error) {
      updateProcessingState({ 
        isProcessing: false, 
        error: error.message || 'An error occurred while generating the script' 
      });
      console.error('Error:', error);
    }
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {/* Bright and clear container */}
      <Paper 
        elevation={6}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 800,
          backgroundColor: '#ffffff', // Bright white background
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
          Test Script Generator
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {/* Framework Selection */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="framework-label">Framework</InputLabel>
            <Select
              labelId="framework-label"
              value={framework}
              label="Framework"
              onChange={(e) => setFramework(e.target.value)}
              required
            >
              <MenuItem value="XCUITest">XCUITest (iOS)</MenuItem>
              <MenuItem value="Espresso">Espresso (Android)</MenuItem>
              <MenuItem value="Playwright">Playwright (Web)</MenuItem>
            </Select>
          </FormControl>

          {/* Pattern Selection */}
          {framework && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Script Pattern</InputLabel>
              <Select
                value={selectedPattern}
                label="Script Pattern"
                onChange={(e) => setSelectedPattern(e.target.value)}
              >
                <MenuItem value="">Default Style</MenuItem>
                {patterns.map(pattern => (
                  <MenuItem key={pattern.id} value={pattern.id}>
                    {pattern.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* UI Elements Definition */}
          <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: '#444' }}>
            Define UI Elements
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Element Name"
              value={newElement.name}
              onChange={(e) => setNewElement({...newElement, name: e.target.value})}
              size="small"
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={newElement.type}
                label="Type"
                onChange={(e) => setNewElement({...newElement, type: e.target.value})}
              >
                {xcuiElementTypes.map((element) => (
                  <MenuItem key={element.value} value={element.value}>
                    {element.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Identifier (optional)"
              value={newElement.identifier}
              onChange={(e) => setNewElement({...newElement, identifier: e.target.value})}
              size="small"
            />
            <IconButton 
              color="primary" 
              onClick={handleAddElement}
              disabled={!newElement.name || !newElement.type}
            >
              <AddIcon />
            </IconButton>
          </Box>

          {uiElements.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Case Name</TableCell>
                    <TableCell>Identifier</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uiElements.map((element) => (
                    <TableRow key={element.id}>
                      <TableCell>{element.name}</TableCell>
                      <TableCell>{element.type}</TableCell>
                      <TableCell>{element.caseName}</TableCell>
                      <TableCell>{element.identifier}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveElement(element.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Screenshot Upload */}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Optional: Upload screenshot for additional UI analysis
          </Typography>
          
          <input
            accept="image/*"
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="screenshot-upload"
          />
          <label htmlFor="screenshot-upload">
            <Button 
              variant="outlined" 
              component="span" 
              fullWidth
              sx={{
                mt: 1,
              }}
            >
              {screenshot ? 'Change Screenshot' : 'Upload Screenshot'}
            </Button>
          </label>
          {screenshot && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Selected file: {screenshot.name}
            </Typography>
          )}

          {/* Use Case Description */}
          <TextField
            fullWidth
            margin="normal"
            label="Use Case Description"
            multiline
            rows={4}
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            required
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={processingState.isProcessing}
          >
            {processingState.isProcessing ? 'Generating Script...' : 'Generate Script'}
          </Button>

          {processingState.error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {processingState.error}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default HomePage;