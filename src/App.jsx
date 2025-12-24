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
import VendorManagement from './components/VendorManagement';
import { SnackbarProvider } from 'notistack';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

// ============================================
// ✅ ENHANCED DARK THEME - MORE COLORFUL
// ============================================
const lightPalette = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff6f00',
    light: '#ff8f00',
    dark: '#e65100',
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
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  text: {
    primary: '#1a202c',
    secondary: '#4a5568',
    disabled: '#a0aec0',
  },
  grey: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923',
  },
};

// ✅ ENHANCED: Vibrant dark theme with colorful accents
const darkPalette = {
  primary: {
    main: '#667eea', // Vibrant blue-purple
    light: '#8b9afc',
    dark: '#4c5fd7',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ff6b9d', // Vibrant pink
    light: '#ff9cc2',
    dark: '#e63971',
    contrastText: '#ffffff',
  },
  success: {
    main: '#4caf50', // Vibrant green
    light: '#80e27e',
    dark: '#087f23',
  },
  error: {
    main: '#f44336', // Vibrant red
    light: '#ff7961',
    dark: '#ba000d',
  },
  warning: {
    main: '#ff9800', // Vibrant amber
    light: '#ffc947',
    dark: '#c66900',
  },
  info: {
    main: '#29b6f6', // Vibrant cyan
    light: '#73e8ff',
    dark: '#0086c3',
  },
  background: {
    default: '#0a0e27', // Deep navy
    paper: '#1a1d3a', // Elevated navy
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b0bec5',
    disabled: '#616161',
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
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: mode === 'dark' 
                ? '0px 4px 20px rgba(102, 126, 234, 0.4)' 
                : '0px 4px 8px rgba(0, 0, 0, 0.12)',
              transform: 'translateY(-2px)',
            },
          },
          contained: {
            background: mode === 'dark' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : undefined,
            '&:hover': {
              boxShadow: mode === 'dark'
                ? '0px 6px 24px rgba(102, 126, 234, 0.6)'
                : '0px 6px 12px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'dark'
              ? '0px 4px 20px rgba(0, 0, 0, 0.4)'
              : '0px 4px 20px rgba(0, 0, 0, 0.08)',
            background: mode === 'dark'
              ? 'linear-gradient(135deg, rgba(26, 29, 58, 0.9) 0%, rgba(26, 29, 58, 1) 100%)'
              : undefined,
            border: mode === 'dark' ? '1px solid rgba(102, 126, 234, 0.1)' : 'none',
            '&:hover': {
              boxShadow: mode === 'dark'
                ? '0px 8px 30px rgba(102, 126, 234, 0.3)'
                : '0px 8px 30px rgba(0, 0, 0, 0.12)',
              borderColor: mode === 'dark' ? 'rgba(102, 126, 234, 0.3)' : undefined,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&:hover fieldset': {
                borderColor: mode === 'dark' ? '#667eea' : undefined,
              },
              '&.Mui-focused fieldset': {
                borderColor: mode === 'dark' ? '#667eea' : undefined,
                boxShadow: mode === 'dark' ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : undefined,
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            backgroundColor: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(26, 29, 58, 0.95)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
          colorSuccess: {
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #4caf50 0%, #087f23 100%)'
              : undefined,
            boxShadow: mode === 'dark' ? '0 2px 8px rgba(76, 175, 80, 0.3)' : undefined,
          },
          colorError: {
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #f44336 0%, #ba000d 100%)'
              : undefined,
            boxShadow: mode === 'dark' ? '0 2px 8px rgba(244, 67, 54, 0.3)' : undefined,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderLeft: mode === 'dark' ? '3px solid transparent' : undefined,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(102, 126, 234, 0.05)' : undefined,
              borderLeftColor: mode === 'dark' ? '#667eea' : undefined,
            },
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
                <Route path="/vendor-management" element={<VendorManagement />} />
              </Route>
            </Route>
          </Routes>
        </SnackbarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;