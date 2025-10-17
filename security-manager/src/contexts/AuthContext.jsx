import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Mock credentials
const MOCK_USERS = {
  admin: { password: 'admin123', name: 'Admin User', role: 'admin' },
  security: { password: 'security123', name: 'Security Guard', role: 'security' },
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = (username, password) => {
    const mockUser = MOCK_USERS[username];

    if (mockUser && mockUser.password === password) {
      setIsAuthenticated(true);
      setUser({ name: mockUser.name, role: mockUser.role });
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
