// Authentication types based on the API response
export interface LoginRequest {
  email: string;
  password: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
  roles: Role[];
  permissions: string[];
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  admin: Admin;
}

export interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}