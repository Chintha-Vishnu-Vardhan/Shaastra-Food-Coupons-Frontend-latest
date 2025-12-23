// src/App.js - BLACK & WHITE THEME UPDATE

import React, { useState, useMemo, createContext, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import DashboardPage from './components/DashboardPage';
import HistoryPage from './components/HistoryPage';
import ProfilePage from './components/ProfilePage';
import { SnackbarProvider } from 'notistack';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

// ✅ NEW BLACK & WHITE THEME PALETTES
const lightPalette = {
  primary: {
    main: '#000000', // Pure Black
    light: '#333333',
    dark: '#000000',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#666666', // Medium Gray
    light: '#888888',
    dark: '#444444',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
  error: {
    main: '#d32f2f',
    light: '#f44336',
    dark: '#c62828',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  info: {
    main: '#333333',
    light: '#666666',
    dark: '#000000',
  },
  background: {
    default: '#ffffff', // Pure White
    paper: '#f5f5f5', // Very Light Gray
    gradient: 'linear-gradient(135deg, #000000 0%, #333333 100%)', // Black gradient
  },
  text: {
    primary: '#000000', // Black text
    secondary: '#666666', // Gray text
    disabled: '#999999',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

const darkPalette = {
  primary: {
    main: '#ffffff', // Pure White
    light: '#ffffff',
    dark: '#cccccc',
    contrastText: '#000000',
  },
  secondary: {
    main: '#aaaaaa', // Light Gray
    light: '#cccccc',
    dark: '#888888',
    contrastText: '#000000',
  },
  success: {
    main: '#66bb6a',
    light: '#a5d6a7',
    dark: '#388e3c',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ffa726',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#cccccc',
    light: '#eeeeee',
    dark: '#999999',
  },
  background: {
    default: '#000000', // Pure Black
    paper: '#1a1a1a', // Very Dark Gray
    gradient: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)', // White gradient
  },
  text: {
    primary: '#ffffff', // White text
    secondary: '#aaaaaa', // Light Gray text
    disabled: '#666666',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'dark');

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const colorMode = useMemo(() => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
  }), []);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? lightPalette : darkPalette),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { 
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', 
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
        letterSpacing: '-0.025em',
      },
      h2: { 
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', 
        fontWeight: 700,
        fontSize: '2rem',
        lineHeight: 1.3,
        letterSpacing: '-0.025em',
      },
      h3: { 
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', 
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h4: { 
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', 
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h5: { 
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', 
        fontWeight: 500,
        fontSize: '1.125rem',
        lineHeight: 1.5,
      },
      h6: { 
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', 
        fontWeight: 500,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      button: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: 600,
        textTransform: 'none',
        fontSize: '0.875rem',
        letterSpacing: '0.025em',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        letterSpacing: '0.00938em',
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
        letterSpacing: '0.01071em',
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
      '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
      '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
      '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
      '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
      '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
      '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
      '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
      '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
      '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
      '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
      '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
      '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
      '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
      '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
      '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
      '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
      '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
      '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
      '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
      '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
      '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 24px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
            '&:hover': {
              boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)',
          },
        },
      },
    },
  }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider 
            maxSnack={5}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={5000}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Routes>
          </SnackbarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;