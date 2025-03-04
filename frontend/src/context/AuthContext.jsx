import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Credenciales predeterminadas para simulación
export const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@serp.cat',
    password: 'admin123',
    name: 'Administrador Centre',
    role: 'emergency_center'
  },
  {
    id: '2',
    email: 'operator@serp.cat',
    password: 'operator123',
    name: 'Operador Emergències',
    role: 'emergency_operator'
  },
  {
    id: '3',
    email: 'resource@serp.cat',
    password: 'resource123',
    name: 'Personal Recursos',
    role: 'resource_personnel'
  }
];

// Función para generar un token JWT simulado
const generateMockToken = (user) => {
  // En una implementación real, esto se haría en el backend
  const now = Date.now() / 1000;
  const expiresIn = 60 * 60; // 1 hora
  
  const payload = {
    sub: user.id,
    name: user.name,
    role: user.role,
    iat: now,
    exp: now + expiresIn
  };
  
  // Simulamos un token codificado (esto no es un token JWT real)
  return btoa(JSON.stringify(payload));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializar usuarios MOCK en localStorage si no existen
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
      const initialUsers = MOCK_USERS.map(user => ({
        ...user,
        status: 'active'
      }));
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Para la simulación, decodificamos nuestro token simulado
        const decodedToken = JSON.parse(atob(token));
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // El token ha expirado
          logout();
          setIsLoading(false);
          return;
        }
        
        // Configurar el token en los headers de axios para futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Obtener información del usuario del token
        setUser({
          id: decodedToken.sub,
          name: decodedToken.name,
          role: decodedToken.role
        });
        
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al verificar el token:', error);
        logout();
        setIsLoading(false);
      }
    };
    
    checkToken();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      setIsLoading(true);
      
      // Obtener usuarios del localStorage
      const storedUsers = localStorage.getItem('users');
      const localUsers = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Buscar el usuario en la lista combinada de usuarios
      const foundUser = localUsers.find(
        u => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Credencials incorrectes');
      }

      // Verificar si el usuario está activo
      if (foundUser.status === 'inactive') {
        throw new Error('Aquest usuari està desactivat');
      }
      
      // Generar un token simulado
      const token = generateMockToken(foundUser);
      
      // Simulamos una respuesta exitosa
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        role: foundUser.role
      };
      
      // Guardar el token en localStorage
      localStorage.setItem('token', token);
      
      // Configurar el token en los headers de axios para futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Establecer el usuario y autenticación
      setUser(userData);
      setIsAuthenticated(true);
      
      return userData.role;
    } catch (err) {
      setError(err.message || 'Error en l\'autenticació');
      setTimeout(() => {
        setError(null);
      }, 3000);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Eliminar el token del localStorage
    localStorage.removeItem('token');
    
    // Eliminar el token de los headers de axios
    delete axios.defaults.headers.common['Authorization'];
    
    // Reiniciar el estado
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 