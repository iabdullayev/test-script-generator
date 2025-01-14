// Component-specific styles using MUI's sx prop system
export const styles = {
  homepage: {
    container: {
      maxWidth: 'lg',
      mx: 'auto',
      py: 4,
    },
    paper: {
      p: 4,
      borderRadius: 2,
      boxShadow: (theme) => theme.shadows[3],
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    },
  },
  
  imageUploader: {
    dropzone: {
      border: '2px dashed',
      borderColor: 'primary.main',
      borderRadius: 2,
      p: 3,
      textAlign: 'center',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'action.hover',
      },
    },
    preview: {
      mt: 2,
      maxWidth: '100%',
      maxHeight: 300,
      objectFit: 'contain',
    },
  },
  
  scriptOutput: {
    container: {
      maxWidth: 'lg',
      mx: 'auto',
      py: 4,
    },
    paper: {
      p: 4,
      borderRadius: 2,
    },
    codeBlock: {
      backgroundColor: 'grey.100',
      p: 2,
      borderRadius: 1,
      fontFamily: 'monospace',
      overflow: 'auto',
      maxHeight: '60vh',
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 2,
      mt: 3,
    },
  },

  processingIndicator: {
    wrapper: {
      textAlign: 'center',
      py: 4,
    },
    progress: {
      my: 2,
    },
    stage: {
      color: 'text.secondary',
      mb: 1,
    },
  },

  navbar: {
    appBar: {
      backgroundColor: 'background.paper',
      color: 'text.primary',
    },
    toolbar: {
      justifyContent: 'space-between',
    },
    logo: {
      height: 40,
      mr: 2,
    },
  },

  frameworkDropdown: {
    formControl: {
      width: '100%',
      mt: 2,
    },
  },

  useCaseInput: {
    textField: {
      mt: 2,
    },
  },
};

// Custom animation keyframes
export const keyframes = {
  fadeIn: {
    '0%': {
      opacity: 0,
    },
    '100%': {
      opacity: 1,
    },
  },
  
  slideUp: {
    '0%': {
      transform: 'translateY(20px)',
      opacity: 0,
    },
    '100%': {
      transform: 'translateY(0)',
      opacity: 1,
    },
  },
  
  pulse: {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.05)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
};

// Animation variants for components
export const animationVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.4 },
  },
  
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};