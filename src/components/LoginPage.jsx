// src/components/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Card,
    Typography,
    TextField,
    Button,
    Box,
    Link,
    IconButton,
    InputAdornment,
    Alert,
    CircularProgress
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        // ✅ FIX: Better validation
        if (!userId.trim() || !password) {
            setError('Please enter both User ID and Password');
            setLoading(false);
            return;
        }
        
        console.log('🔐 Attempting login for:', userId.trim().toUpperCase());
        
        try {
            await login(userId.trim(), password);
            console.log('✅ Login successful, redirecting...');
            navigate('/dashboard');
        } catch (errorMessage) {
            console.error('❌ Login failed:', errorMessage);
            setError(errorMessage || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Card sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                <Typography component="h1" variant="h5" gutterBottom>
                    Shaastra Wallet Login
                </Typography>
                
                {/* ✅ FIX: Better error display */}
                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="userId"
                        label="User ID (Roll Number)"
                        name="userId"
                        autoComplete="username"
                        autoFocus
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        disabled={loading}
                        placeholder="e.g., CE23B005"
                        helperText="Enter your roll number (case-insensitive)"
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                disabled={loading}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Login'}
                    </Button>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Link component={RouterLink} to="/forgot-password" variant="body2">
                            Forgot Password?
                        </Link>
                        <Link component={RouterLink} to="/register" variant="body2">
                            {"Don't have an account? Register"}
                        </Link>
                    </Box>
                </Box>
                
                {/* ✅ FIX: Debug info (remove in production) */}
                <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1, width: '100%' }}>
                    <Typography variant="caption" color="text.secondary">
                        🔧 Debug: API URL = {process.env.REACT_APP_API_URL || 'http://localhost:5000'}
                    </Typography>
                </Box>
            </Card>
        </Container>
    );
};

export default LoginPage;