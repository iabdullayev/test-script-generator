import axios from 'axios';

class AIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds
    });
  }

  async generateScript(formData, callbacks = {}) {
    const {
      onAnalysisStart,
      onAnalysisComplete,
      onGenerationStart,
      onGenerationComplete,
      onError
    } = callbacks;

    try {
      // Start screenshot analysis
      onAnalysisStart?.();
      const response = await this.client.post('/api/analyze-screenshot', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      onAnalysisComplete?.();

      // Start script generation
      onGenerationStart?.();
      const scriptResponse = await this.client.post('/api/generate-script', {
        elements: response.data.elements,
        framework: formData.get('framework'),
        useCase: formData.get('useCase'),
        accessibilityId: formData.get('accessibilityId')
      });
      onGenerationComplete?.();

      return scriptResponse.data.script;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  }

  async getScriptSuggestions(screenshot, framework) {
    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      formData.append('framework', framework);

      const response = await this.client.post('/api/get-suggestions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      return response.data.suggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  }
}

export default new AIService();