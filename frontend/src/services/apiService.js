import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const generateScript = async (formData) => {
  try {
    const data = new FormData();
    data.append('screenshot', formData.screenshot);
    data.append('framework', formData.framework);
    data.append('useCase', formData.useCase);

    const response = await axios.post(`${API_URL}/api/generate`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to generate script');
  }
};