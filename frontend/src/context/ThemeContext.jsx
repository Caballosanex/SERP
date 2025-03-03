import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext(null);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          emergency: {
            main: '#f44336',
            light: '#ff7961',
            dark: '#ba000d',
            contrastText: '#fff',
          },
          resource: {
            main: '#4caf50',
            light: '#80e27e',
            dark: '#087f23',
            contrastText: '#fff',
          },
          ...(mode === 'dark' && {
            background: {
              default: '#303030',
              paper: '#424242',
            },
          }),
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#1e1e1e' : '#1976d2',
              },
            },
          },
        },
      }),
    [mode]
  );

  const value = {
    mode,
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}; 