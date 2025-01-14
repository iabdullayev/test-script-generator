import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function FrameworkDropdown({ value, onChange }) {
  return (
    <FormControl fullWidth margin="normal">
      <InputLabel>Framework</InputLabel>
      <Select
        value={value}
        label="Framework"
        onChange={(e) => onChange(e.target.value)}
        required
      >
        <MenuItem value="XCUITest">XCUITest (iOS)</MenuItem>
        <MenuItem value="Espresso">Espresso (Android)</MenuItem>
        <MenuItem value="Playwright">Playwright (Web)</MenuItem>
      </Select>
    </FormControl>
  );
}

export default FrameworkDropdown;