require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { generateAIScript } = require('./src/ai/aiIntegration');
const { scriptTemplates } = require('./src/templates/scriptTemplates');

// Suppress deprecation warning
process.removeAllListeners('warning');

// Environment check
console.log('Environment check:', {
  nodeEnv: process.env.NODE_ENV,
  hasGoogleAIKey: !!process.env.GOOGLE_AI_KEY,
  port: process.env.PORT
});

const app = express();

// Add these configurations for large payloads
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Middleware
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Get available patterns for a framework
app.get('/api/patterns/:framework', (req, res) => {
  try {
    const { framework } = req.params;
    const patterns = Object.entries(scriptTemplates[framework] || {}).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description || ''
    }));
    res.json(patterns);
  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch patterns' 
    });
  }
});

// Generate script endpoint
app.post('/api/generate', upload.single('screenshot'), async (req, res) => {
  try {
    const { useCase, framework, pattern, predefinedElements } = req.body;
    console.log('Received request with:', { 
      useCase, 
      framework, 
      pattern,
      hasScreenshot: !!req.file,
      hasPredefinedElements: !!predefinedElements 
    });

    const script = await generateAIScript(
      req.file?.path,
      useCase,
      framework,
      pattern,
      predefinedElements
    );

    res.status(200).json({ 
      success: true, 
      script,
      message: 'Script generated successfully' 
    });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate script',
      error: error.toString()
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});