import axios from 'axios';
import { getErrorMessage } from './utils';
import { PaginatedResponse, ApiResponse } from '@shared/types';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for authentication
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Initialize auth token from storage
const storedToken = localStorage.getItem('token');
if (storedToken) {
  setAuthToken(storedToken);
}

// Add a request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors like 401 Unauthorized, 403 Forbidden, etc.
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        // Clear local storage and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
      
      if (status === 403) {
        console.error('Forbidden: You do not have permission to access this resource');
      }
      
      if (status === 500) {
        console.error('Server error:', error.response.data);
      }
      
      return Promise.reject({
        status,
        message: error.response.data.message || 'An error occurred',
        data: error.response.data,
      });
    }
    
    return Promise.reject({
      message: error.message || 'Network error occurred',
    });
  }
);

// Generic API methods
export const apiService = {
  // GET request
  async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await api.get<ApiResponse<T>>(url, { params });
      return response.data.data as T;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // GET paginated request
  async getPaginated<T>(url: string, params?: any): Promise<PaginatedResponse<T>> {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<T>>>(url, { params });
      return response.data.data as PaginatedResponse<T>;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // POST request
  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await api.post<ApiResponse<T>>(url, data);
      return response.data.data as T;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // PUT request
  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await api.put<ApiResponse<T>>(url, data);
      return response.data.data as T;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // PATCH request
  async patch<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await api.patch<ApiResponse<T>>(url, data);
      return response.data.data as T;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // DELETE request
  async delete<T>(url: string): Promise<T> {
    try {
      const response = await api.delete<ApiResponse<T>>(url);
      return response.data.data as T;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Upload file
  async uploadFile<T>(url: string, file: File, additionalData?: any): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          formData.append(key, additionalData[key]);
        });
      }
      
      const response = await api.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data as T;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default apiService;
