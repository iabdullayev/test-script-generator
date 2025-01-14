import { useReducer, useCallback } from 'react';

const initialState = {
  framework: '',
  useCase: '',
  accessibilityId: '',
  isValid: false
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      const newState = {
        ...state,
        [action.field]: action.value
      };
      return {
        ...newState,
        isValid: validateForm(newState)
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function validateForm(state) {
  return Boolean(
    state.framework &&
    state.useCase &&
    state.useCase.length >= 10
  );
}

export function useFormState() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setField = useCallback((field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    formState: state,
    setField,
    resetForm
  };
}