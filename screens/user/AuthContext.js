import React, { createContext, useContext, useState } from 'react';

// Kreiraj kontekst
const AuthContext = createContext();

// Provider komponenta
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Alma Bradarić',
    role: 'user',
    email: 'test1@gmail.com'
    // Dodajte druge korisničke podatke po potrebi
  });

  // Mock login/logout funkcije za testiranje
  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook za korištenje konteksta
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth mora biti korišten unutar AuthProvidera');
  }
  return context;
};