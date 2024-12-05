import { createContext, useState, useContext, useEffect } from 'react';
import * as jwt from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt.jwtDecode(token);
        setUser(decoded.user);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwt.jwtDecode(token);
    setUser(decoded.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt.jwtDecode(token);
        
        const updatedUserData = { 
          ...decoded.user, 
          ...userData 
        };
        
        if (!userData.profilePicture && decoded.user.profilePicture) {
          updatedUserData.profilePicture = decoded.user.profilePicture;
        }
        
        setUser(updatedUserData);
      } catch (error) {
        console.error('Error updating user:', error);
      }
    } else {
      setUser(userData);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 