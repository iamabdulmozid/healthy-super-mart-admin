import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: string[];
  validationErrors?: Record<string, string[]>;
}

class ApiClient {
  private client: AxiosInstance;
  private baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.healthysupermart.com/api/v1';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add auth token if available
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle common errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private handleResponseError(error: AxiosError): Promise<never> {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      this.clearTokens();
      window.location.href = '/login';
    }

    // Create standardized error format
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status || 500,
    };

    if (error.response?.data) {
      const errorData = error.response.data as any;
      
      // Handle new API error format
      apiError.code = errorData.code;
      
      // Primary message - use errors[0] if available, fallback to message
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        apiError.message = errorData.errors[0];
        apiError.errors = errorData.errors;
      } else {
        apiError.message = errorData.message || errorData.error || apiError.message;
      }
      
      // Legacy validation errors format (object with field keys)
      if (errorData.errors && typeof errorData.errors === 'object' && !Array.isArray(errorData.errors)) {
        apiError.validationErrors = errorData.errors;
      }
    }

    return Promise.reject(apiError);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Token management
  setAuthToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  clearAuth(): void {
    this.clearTokens();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;