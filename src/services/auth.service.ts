import { apiClient } from '@/lib/api-client';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/admin/login', credentials);
      
      // Store tokens
      apiClient.setAuthToken(response.access_token);
      apiClient.setRefreshToken(response.refresh_token);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post<LoginResponse>('/auth/refresh', {
        refresh_token: refreshToken,
      });
      
      // Store new tokens
      apiClient.setAuthToken(response.access_token);
      apiClient.setRefreshToken(response.refresh_token);
      
      return response;
    } catch (error) {
      // If refresh fails, clear tokens and redirect to login
      apiClient.clearAuth();
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      // Optionally call logout endpoint
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if logout API fails, clear local tokens
      console.warn('Logout API call failed:', error);
    } finally {
      apiClient.clearAuth();
    }
  }

  static getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token'),
    };
  }

  static getStoredAdmin(): any {
    try {
      const adminData = localStorage.getItem('admin_data');
      return adminData ? JSON.parse(adminData) : null;
    } catch {
      return null;
    }
  }

  static setStoredAdmin(admin: any): void {
    localStorage.setItem('admin_data', JSON.stringify(admin));
  }

  static clearStoredAdmin(): void {
    localStorage.removeItem('admin_data');
  }
}