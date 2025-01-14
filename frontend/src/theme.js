import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200EE',
    },
    secondary: {
      main: '#03DAC5',
    },
  },
  typography: {
    // Set Poppins as the default font, fallback to sans-serif
    fontFamily: 'Poppins, Roboto, Arial, sans-serif',
    // Optional: Tweak headings
    h1: {
      fontWeight: 600, // Bold
    },
    h2: {
      fontWeight: 600,
    },
    // etc.
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
    },
  },
});

export default theme;