// src/components/layout/Header.tsx
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { admin, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  return (
    <header className="bg-white shadow px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Grocery POS & Admin</h1>
      
      <div className="flex items-center space-x-4">
        {admin && (
          <div className="flex items-center space-x-3">
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {admin.firstName} {admin.lastName}
              </p>
              <p className="text-gray-500">
                {admin.roles.map(role => role.name).join(', ')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}