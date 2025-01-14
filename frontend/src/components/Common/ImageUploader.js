import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function ImageUploader({ onImageSelect }) {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      <input
        accept="image/*"
        type="file"
        id="screenshot-upload"
        hidden
        onChange={handleFileChange}
      />
      <label htmlFor="screenshot-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUploadIcon />}
          fullWidth
        >
          Upload Screenshot
        </Button>
      </label>
      {preview && (
        <Box sx={{ mt: 2 }}>
          <img
            src={preview}
            alt="Screenshot preview"
            style={{ maxWidth: '100%', borderRadius: '4px' }}
          />
        </Box>
      )}
    </Box>
  );
}

export default ImageUploader;