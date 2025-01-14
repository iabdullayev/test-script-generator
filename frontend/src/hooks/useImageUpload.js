import { useState, useCallback } from 'react';
import { validateImage } from '../utils/validation';

export function useImageUpload() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = useCallback((file) => {
    try {
      validateImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setImage(file);
      setError(null);
    } catch (err) {
      setError(err.message);
      setImage(null);
      setPreview(null);
    }
  }, []);

  const resetImage = useCallback(() => {
    setImage(null);
    setPreview(null);
    setError(null);
  }, []);

  return {
    image,
    preview,
    error,
    handleImageUpload,
    resetImage
  };
}