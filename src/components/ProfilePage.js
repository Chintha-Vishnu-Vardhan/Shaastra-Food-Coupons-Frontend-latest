// src/components/ProfilePage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    Container, Card, Typography, Box, Button, CircularProgress, Divider,
    Modal, TextField 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api'; // Import api

// Define modal style (can be shared or redefined)
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
  overflowY: 'auto'
};

const ProfilePage = () => {
  // Get user details and logout function from authentication context
  const { user, logout, isAuthenticated } = useAuth();

  // --- State for S-Pin Reset Modal ---
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 for button, 2 for OTP/new pin
  const [otp, setOtp] = useState('');
  const [newSPin, setNewSPin] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Modal Handlers ---
  const handleOpen = () => {
    setOpen(true);
    setStep(1);
    setMessage('');
    setOtp('');
    setNewSPin('');
  };
  const handleClose = () => setOpen(false);

  // Handle case where user data might still be loading or user is not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  // --- S-Pin API Handlers ---

  // Step 1: Request OTP
  const handleRequestOtp = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/api/auth/forgot-spin-otp');
      setMessage(response.data.message);
      setStep(2); // Move to OTP entry step
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending OTP.');
    }
    setLoading(false);
  };

  // Step 2: Verify OTP and Reset S-Pin
  const handleResetSpin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const body = { otp, newSPin };
      const response = await api.post('/api/auth/reset-spin', body);
      setMessage(response.data.message);
      setLoading(false);
      // On success, close modal after a short delay
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'S-Pin reset failed.');
      setLoading(false);
    }
  };

  // Calls the logout function from the AuthContext
  const handleLogout = () => {
    logout();
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Card sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          User Profile
        </Typography>

        {/* Display user details */}
        <Box sx={{ width: '100%', mt: 2 }}>
          <ProfileDetail label="Name" value={user.name} />
          <Divider sx={{ my: 1.5 }} />
          <ProfileDetail label="Roll Number (User ID)" value={user.userId} />
          <Divider sx={{ my: 1.5 }} />
          <ProfileDetail label="Designation (Role)" value={user.role} />
          <Divider sx={{ my: 1.5 }} />
          <ProfileDetail label="Department" value={user.department || 'N/A'} />
          <Divider sx={{ my: 1.5 }} />
          <ProfileDetail label="Contact Number" value={user.contact || 'N/A'} />
          <Divider sx={{ my: 1.5 }} />
          <ProfileDetail label="Smail ID" value={user.smail || 'N/A'} />
        </Box>

        {/* --- Action Buttons --- */}
        <Button
           component={RouterLink}
           to="/dashboard"
           variant="contained"
           sx={{ mt: 4, width: '100%' }}
         >
           Back to Dashboard
         </Button>
         
        {/* --- ADDED S-PIN BUTTON --- */}
        <Button
          variant="outlined"
          color="warning"
          onClick={handleOpen}
          sx={{ mt: 2, width: '100%' }}
        >
          Reset S-Pin
        </Button>
        {/* --- END ADDITION --- */}

        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          sx={{ mt: 2, width: '100%' }}
        >
          Logout
        </Button>
      </Card>

      {/* --- ADDED S-PIN RESET MODAL --- */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography component="h2" variant="h6" gutterBottom>
            Reset S-Pin
          </Typography>

          {loading && <CircularProgress sx={{ my: 2 }} />}

          {!loading && message && (
            <Typography
              color={message.includes('successful') || message.includes('sent') ? 'success.main' : 'error'}
              align="center"
              variant="body2"
              sx={{ my: 2 }}
            >
              {message}
            </Typography>
          )}

          {/* Step 1: Button to request OTP */}
          {!loading && step === 1 && (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                An OTP will be sent to your registered s-mail ID ({user.smail}) to verify your identity.
              </Typography>
              <Button variant="contained" onClick={handleRequestOtp} fullWidth>
                Send OTP
              </Button>
            </>
          )}

          {/* Step 2: Form to enter OTP and new S-Pin */}
          {!loading && step === 2 && (
            <Box component="form" onSubmit={handleResetSpin}>
              <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="otp"
                  label="OTP from E-mail"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
              />
              <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newSPin"
                  label="New 4-Digit S-Pin"
                  type="password" // Hide S-Pin
                  value={newSPin}
                  onChange={(e) => setNewSPin(e.target.value)}
                  inputProps={{ 
                      maxLength: 4, 
                      inputMode: 'numeric', 
                      pattern: '[0-9]*' 
                  }}
              />
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                Confirm & Reset S-Pin
              </Button>
            </Box>
          )}

        </Box>
      </Modal>
      {/* --- END MODAL --- */}

    </Container>
  );
};

// Helper component for consistent detail display
const ProfileDetail = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
    <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
      {label}:
    </Typography>
    <Typography variant="body1">
      {value || 'N/A'} {/* Fallback for potentially null/undefined values */}
    </Typography>
  </Box>
);

export default ProfilePage;