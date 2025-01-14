import { useState, useCallback } from 'react';
import { generateScript } from '../services/apiService';
import { useAIProcessing } from '../context/AIProcessingContext';

export function useScript() {
  const [script, setScript] = useState(null);
  const { updateProcessingState } = useAIProcessing();

  const generateTestScript = useCallback(async (formData) => {
    try {
      updateProcessingState({ isProcessing: true, stage: 'uploading' });
      
      const result = await generateScript(formData, (stage, progress) => {
        updateProcessingState({ stage, progress });
      });

      setScript(result.script);
      return result.script;
    } catch (error) {
      updateProcessingState({ error: error.message });
      throw error;
    }
  }, [updateProcessingState]);

  const resetScript = useCallback(() => {
    setScript(null);
    updateProcessingState({ isProcessing: false, stage: null, progress: 0 });
  }, [updateProcessingState]);

  return {
    script,
    generateTestScript,
    resetScript
  };
}