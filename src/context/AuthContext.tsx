import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { AuthService } from '@/services/auth.service';
import type { AuthState, AuthContextType, LoginRequest, Admin } from '@/types/auth';

// Auth Reducer
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { admin: Admin; accessToken: string; refreshToken: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_AUTH'; payload: { admin: Admin; accessToken: string; refreshToken: string } };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
    case 'SET_AUTH':
      return {
        ...state,
        isAuthenticated: true,
        admin: action.payload.admin,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        loading: false,
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        admin: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  admin: null,
  accessToken: null,
  refreshToken: null,
  loading: true, // Start with loading true to check stored tokens
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored authentication on mount
  useEffect(() => {
    const checkStoredAuth = () => {
      const { accessToken, refreshToken } = AuthService.getStoredTokens();
      const admin = AuthService.getStoredAdmin();

      if (accessToken && refreshToken && admin) {
        dispatch({
          type: 'SET_AUTH',
          payload: { admin, accessToken, refreshToken },
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await AuthService.login(credentials);
      
      // Store admin data for persistence
      AuthService.setStoredAdmin(response.admin);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          admin: response.admin,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        },
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error; // Re-throw to let components handle the error
    }
  };

  const logout = (): void => {
    AuthService.logout();
    AuthService.clearStoredAdmin();
    dispatch({ type: 'LOGOUT' });
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.admin) return false;
    return state.admin.permissions.includes(permission);
  };

  const hasRole = (roleName: string): boolean => {
    if (!state.admin) return false;
    return state.admin.roles.some(role => role.name === roleName);
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;