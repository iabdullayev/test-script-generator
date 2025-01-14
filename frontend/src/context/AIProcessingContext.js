import React, { createContext, useContext, useState } from 'react';

const AIProcessingContext = createContext(null);

export function AIProcessingProvider({ children }) {
  const [processingState, setProcessingState] = useState({
    isProcessing: false,
    stage: null,
    progress: 0,
    error: null
  });

  const updateProcessingState = (newState) => {
    setProcessingState(prev => ({ ...prev, ...newState }));
  };

  const value = {
    processingState,
    updateProcessingState
  };

  return (
    <AIProcessingContext.Provider value={value}>
      {children}
    </AIProcessingContext.Provider>
  );
}

export function useAIProcessing() {
  const context = useContext(AIProcessingContext);
  if (!context) {
    throw new Error('useAIProcessing must be used within an AIProcessingProvider');
  }
  return context;
}