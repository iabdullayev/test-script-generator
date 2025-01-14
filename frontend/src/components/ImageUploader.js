import React from 'react';
import { Button, Typography } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';

const ImageUploader = ({ onChange, file }) => {
  return (
    <div>
      <input
        accept="image/*"
        type="file"
        onChange={onChange}
        style={{ display: 'none' }}
        id="screenshot-upload"
        name="screenshot"
        required
      />
      <label htmlFor="screenshot-upload">
        <Button 
          variant="outlined" 
          component="span" 
          fullWidth 
          startIcon={<UploadIcon />}
          sx={{ mt: 2 }}
        >
          {file ? 'Change Screenshot' : 'Upload Screenshot'}
        </Button>
      </label>
      {file && (
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Selected file: {file.name}
        </Typography>
      )}
    </div>
  );
};

export default ImageUploader;