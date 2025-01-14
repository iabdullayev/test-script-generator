export const validateImage = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!validTypes.includes(file.type)) {
    throw new Error('Please upload a valid image file (JPEG, PNG, or WebP)');
  }

  if (file.size > maxSize) {
    throw new Error('Image size should be less than 5MB');
  }

  return true;
};

// utils/formatters.js
export const formatScript = (script, framework) => {
  // Add proper indentation and formatting
  let formatted = script;
  
  // Add framework-specific formatting
  switch (framework) {
    case 'XCUITest':
      formatted = formatted.replace(/\n/g, '\n    ');
      break;
    case 'Espresso':
      formatted = formatted.replace(/\n/g, '\n        ');
      break;
    case 'Playwright':
      formatted = formatted.replace(/\n/g, '\n  ');
      break;
    default:
      break;
  }

  return formatted;
};