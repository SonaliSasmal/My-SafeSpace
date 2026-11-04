import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  getToken,
  getUser,
  saveAuth,
  clearAuth,
} from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await getToken();
      const storedUser = await getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Failed to load authentication:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(newToken, newUser) {
    await saveAuth(newToken, newUser);

    setToken(newToken);
    setUser(newUser);
  }

  async function logout() {
    await clearAuth();

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}