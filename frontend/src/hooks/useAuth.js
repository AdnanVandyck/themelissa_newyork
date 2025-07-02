// src/hooks/useAuth.js
import { useState } from 'react';
import { useAuth as useAuthContext } from '../context/AuthContext';

// Re-export the useAuth hook from AuthContext for easier imports
export const useAuth = useAuthContext;

// Custom hook for API calls that require authentication
export const useApi = () => {
  const { apiRequest } = useAuthContext();
  
  return {
    // Units API calls
    units: {
      getAll: () => apiRequest('/units'),
      getPublic: () => apiRequest('/units/public'),
      getById: (id) => apiRequest(`/units/${id}`),
      create: (unitData) => apiRequest('/units', {
        method: 'POST',
        body: JSON.stringify(unitData)
      }),
      update: (id, unitData) => apiRequest(`/units/${id}`, {
        method: 'PUT',
        body: JSON.stringify(unitData)
      }),
      delete: (id) => apiRequest(`/units/${id}`, {
        method: 'DELETE'
      }),
      uploadImage: (formData) => apiRequest('/units/upload-image', {
        method: 'POST',
        headers: {}, // Let browser set Content-Type for FormData
        body: formData
      })
    },

    // Auth API calls  
    auth: {
      register: (userData) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
      verify: () => apiRequest('/auth/verify')
    }
  };
};

// Custom hook for managing loading states
export const useLoadingState = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const startLoading = () => {
    setLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setLoading(false);
  };

  const setSuccess = (result) => {
    setData(result);
    setLoading(false);
    setError(null);
  };

  const setFailure = (errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return {
    loading,
    error,
    data,
    startLoading,
    stopLoading,
    setSuccess,
    setFailure,
    reset
  };
};

// Custom hook for form handling with validation
export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur
    if (validationRules[name]) {
      const error = validationRules[name](values[name]);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validationRules[field](values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {}));

    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

// Custom hook for admin operations
export const useAdmin = () => {
  const { user, isAdmin } = useAuthContext();
  const api = useApi();

  const checkAdminAccess = () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    if (!isAdmin()) {
      throw new Error('Admin access required');
    }
    return true;
  };

  const adminOperations = {
    // Unit management
    createUnit: async (unitData) => {
      checkAdminAccess();
      return await api.units.create(unitData);
    },
    
    updateUnit: async (id, unitData) => {
      checkAdminAccess();
      return await api.units.update(id, unitData);
    },
    
    deleteUnit: async (id) => {
      checkAdminAccess();
      return await api.units.delete(id);
    },
    
    uploadUnitImage: async (formData) => {
      checkAdminAccess();
      return await api.units.uploadImage(formData);
    }
  };

  return {
    ...adminOperations,
    isAdmin: isAdmin(),
    adminUser: user
  };
};