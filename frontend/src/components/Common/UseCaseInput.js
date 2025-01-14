import React from 'react';
import { TextField } from '@mui/material';

function UseCaseInput({ value, onChange }) {
  return (
    <TextField
      label="Test Case Description"
      multiline
      rows={4}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      margin="normal"
      required
      helperText="Describe what you want to test in detail"
    />
  );
}

export default UseCaseInput;