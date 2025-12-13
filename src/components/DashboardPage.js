// src/components/DashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, Typography, Button, TextField, Container, CircularProgress,
    Modal, List, ListItem, ListItemText, Divider, Paper,
    Select, MenuItem, FormControl, InputLabel, Checkbox, FormControlLabel, Grid,
    IconButton, Snackbar,
    InputAdornment
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddCardIcon from '@mui/icons-material/AddCard';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import QRCode from 'react-qr-code';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const MIN_ANIMATION_TIME = 1500; // milliseconds

// Responsive Modal Style
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

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [idModalOpen, setIdModalOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // Page Title component
    const PageTitle = () => (
        <Box sx={{ mb: 4, mt: 2, textAlign: 'center' }}>
            <Typography 
                variant="h5" 
                component="h1" 
                gutterBottom 
                sx={{ 
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 800,
                    background: 'linear-gradient(45deg, #007FFF, #0059B2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                    fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
                }}
            >
                My Shaastra Wallet
            </Typography>
        </Box>
    );

    // Send Money State
    const [open, setOpen] = useState(false);
    const [receiverId, setReceiverId] = useState('');
    const [amount, setAmount] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    // Top Up State
    const [topUpOpen, setTopUpOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');

    // Receive Modal State
    const [receiveOpen, setReceiveOpen] = useState(false);

    // Group Send State
    const [groupOpen, setGroupOpen] = useState(false);
    const [targetRole, setTargetRole] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [recipients, setRecipients] = useState({});
    const [commonAmount, setCommonAmount] = useState('');
    
    // S-Pin Modal State
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [sPin, setSPin] = useState('');
    const [pendingTransaction, setPendingTransaction] = useState(null);
    const [showSPin, setShowSPin] = useState(false);

    // Modal Handlers
    const handleOpen = () => setOpen(true);
    const handleClose = () => { setOpen(false); setMessage(''); setReceiverId(''); setAmount(''); setIsScanning(false); };
    const handleTopUpOpen = () => setTopUpOpen(true);
    const handleTopUpClose = () => { setTopUpOpen(false); setMessage(''); setTopUpAmount(''); };
    const handleReceiveOpen = () => setReceiveOpen(true);
    const handleReceiveClose = () => setReceiveOpen(false);
    const handleGroupOpen = () => setGroupOpen(true);
    const handleGroupClose = () => {
        setGroupOpen(false); setMessage(''); setTargetRole('');
        setGroupMembers([]); setRecipients({}); setCommonAmount('');
    };
    const handlePinModalClose = () => {
        if (isSending) return;
        setIsPinModalOpen(false);
        setMessage('');
        setSPin('');
        setPendingTransaction(null);
        setShowSPin(false);
    }

    const handleIdClose = () => setIdModalOpen(false);
    const handleCopyId = async () => {
        try {
            await navigator.clipboard.writeText(user.rollNumber || user.userId || '');
            setSnackbarOpen(true);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };
    const handleSnackbarClose = () => setSnackbarOpen(false);

    const handleClickShowSPin = () => setShowSPin((show) => !show);
    const handleMouseDownSPin = (event) => {
        event.preventDefault();
    };

    // Data Fetching
    const fetchHistory = useCallback(async () => {
        if (!user) return;
        try {
            const historyRes = await api.get('/api/wallet/history');
            setTransactions(historyRes.data);
        } catch (error) { console.error('Failed to fetch history:', error); }
    }, [user]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    useEffect(() => {
        if (groupOpen && targetRole) {
            const fetchDeptMembersByRole = async () => {
                setMessage(''); setGroupMembers([]); setRecipients({});
                try {
                    const res = await api.get(`/api/user/by-role-in-my-department?role=${targetRole}`);
                    const members = res.data || [];
                    setGroupMembers(members);
                    const initialRecipients = members.reduce((acc, member) => {
                        acc[member.userId] = { selected: true, amount: '' };
                        return acc;
                    }, {});
                    setRecipients(initialRecipients);
                } catch (err) {
                    console.error("Failed to fetch department members:", err);
                    setMessage(err.response?.data?.message || 'Error fetching members.');
                }
            };
            fetchDeptMembersByRole();
        } else {
            setGroupMembers([]); setRecipients({});
        }
    }, [groupOpen, targetRole]);

    // Event Handlers
    const handleRecipientToggle = (userId) => {
        setRecipients(prev => ({
            ...prev,
            [userId]: { ...prev[userId], selected: !prev[userId].selected }
        }));
    };

    const handleAmountChange = (userId, value) => {
        const sanitizedValue = value.match(/^\d*\.?\d*$/) ? value : recipients[userId]?.amount || '';
        setRecipients(prev => ({
            ...prev,
            [userId]: { ...prev[userId], amount: sanitizedValue }
        }));
    };

    const handleApplyCommonAmount = () => {
        const amountToApply = commonAmount.match(/^\d*\.?\d*$/) ? commonAmount : '';
        if (amountToApply === '' || parseFloat(amountToApply) <= 0) {
            setMessage('Please enter a valid positive common amount.');
            return;
        }
        setRecipients(prev => {
            const newRecipients = { ...prev };
            Object.keys(newRecipients).forEach(userId => {
                if (newRecipients[userId].selected) {
                    newRecipients[userId].amount = amountToApply;
                }
            });
            return newRecipients;
        });
        setMessage('');
    };

    // ✅ FIXED: QR Scan Handler - Updated to handle multiple result formats and check for self-scan
    const handleScanResult = (result) => {
        try {
            let scannedData = null;
            
            // Handle different result formats from the scanner library
            if (typeof result === 'string') {
                scannedData = result;
            } else if (result?.data) {
                scannedData = result.data;
            } else if (result?.text) {
                scannedData = result.text;
            } else if (result?.rawValue) {
                scannedData = result.rawValue;
            } else if (Array.isArray(result) && result.length > 0) {
                scannedData = result[0]?.rawValue || result[0]?.data || result[0];
            }
            
            if (scannedData) {
                const trimmedData = scannedData.trim();
                
                // ✅ FIXED: Check if scanning own QR code
                if (trimmedData === user.userId || trimmedData === user.rollNumber) {
                    setMessage('Cannot send money to yourself. Please scan a different QR code.');
                    return; // Don't close scanner, let user try again
                }
                
                setReceiverId(trimmedData);
                setIsScanning(false);
                // ✅ FIXED: Better success message prompting for amount
                setMessage('QR code scanned successfully! Please enter the amount.');
            } else {
                console.warn('Invalid QR scan result:', result);
                setMessage('Invalid QR code format. Please try again.');
            }
        } catch (error) {
            console.error('Error processing QR result:', error);
            setMessage('Error reading QR code. Please try again or enter manually.');
        }
    };

    // S-PIN FLOW STEP 1: Intercept Transaction
    const handleSendMoney = async (e) => {
        e.preventDefault(); 
        setMessage('');
        
        if (Number(amount) <= 0) {
            setMessage("Amount must be greater than 0.");
            return;
        }

        // ✅ FIXED: Check if trying to send money to self (by manual ID entry)
        if (receiverId.trim() === user.userId || receiverId.trim() === user.rollNumber) {
            setMessage("Cannot send money to yourself.");
            return; // Stay on the send modal, don't proceed
        }

        setPendingTransaction({ 
            type: 'send', 
            payload: { receiverId, amount: Number(amount) } 
        });
        
        setSPin(''); 
        setIsPinModalOpen(true);
        handleClose();
    };

    const handleTopUp = async (e) => {
        e.preventDefault(); 
        setMessage('');

        if (Number(topUpAmount) <= 0) {
            setMessage("Amount must be greater than 0.");
            return;
        }

        setPendingTransaction({ 
            type: 'topup', 
            payload: { amount: Number(topUpAmount) } 
        });
        
        setSPin(''); 
        setIsPinModalOpen(true);
        handleTopUpClose();
    };

    const handleSendGroup = async (e) => {
        e.preventDefault(); 
        setMessage('');
        
        const finalRecipients = Object.entries(recipients)
            .filter(([, data]) => data.selected && data.amount && parseFloat(data.amount) > 0)
            .map(([userId, data]) => ({
                 receiverId: userId,
                 amount: Number(parseFloat(data.amount).toFixed(2))
            }));

        if (finalRecipients.length === 0) {
            setMessage('Please select recipients and enter a valid positive amount.'); 
            return;
        }
        
        const totalAmountToSend = finalRecipients.reduce((sum, r) => sum + r.amount, 0);
        // ✅ FIXED: Changed $ to ₹ in error message
        if (user && user.balance < totalAmountToSend) {
             setMessage(`Insufficient balance. Need: ₹${totalAmountToSend.toFixed(2)}`);
             return; 
        }

        setPendingTransaction({ 
            type: 'group', 
            payload: { recipients: finalRecipients } 
        });
        
        setSPin(''); 
        setIsPinModalOpen(true);
        handleGroupClose();
    };

    // S-PIN FLOW STEP 2: Handle Final Confirmation
    const handleConfirmTransaction = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSending(true);

        const startTime = Date.now();
        let apiEndpoint = '';
        let apiPayload = {};

        if (!pendingTransaction) {
            setMessage('Error: No transaction is pending.');
            setIsSending(false);
            return;
        }

        if (pendingTransaction.type === 'send') {
            apiEndpoint = '/api/wallet/send';
            apiPayload = { ...pendingTransaction.payload, sPin };
        } else if (pendingTransaction.type === 'topup') {
            apiEndpoint = '/api/wallet/topup';
            apiPayload = { ...pendingTransaction.payload, sPin };
        } else if (pendingTransaction.type === 'group') {
            apiEndpoint = '/api/wallet/send-group';
            apiPayload = { ...pendingTransaction.payload, sPin };
        }

        try {
            await api.post(apiEndpoint, apiPayload);
            setMessage('Transaction successful!');
            
            const elapsedTime = Date.now() - startTime;
            const remainingTime = MIN_ANIMATION_TIME - elapsedTime;
            
            setTimeout(async () => {
                setIsSending(false);
                handlePinModalClose();
                await fetchHistory();
                window.location.reload();
            }, remainingTime > 0 ? remainingTime : 0);
        
        } catch (error) {
            setMessage(error.response?.data?.message || 'Transaction failed.');
            setIsSending(false);
            setSPin('');
        }
    };

    const handleLogout = () => { logout(); };

    if (!user) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4, pb: 4 }}>
            <PageTitle />
            
            {/* Balance Card */}
            <Card sx={{ p: 3, mb: 4, backgroundColor: '#6da9d2ff', color: 'white', borderRadius: 4, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {user.rollNumber || user.userId || 'Not Available'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center', fontSize: '1.5rem' }}>
                        ₹{user.balance.toFixed(2)}
                    </Typography>
                </Box>
            </Card>

            {/* Quick Actions */}
            <Typography variant="h6" align="left" gutterBottom sx={{ mb: 2 }}>Quick Actions</Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6} sm={4}><Button variant="contained" startIcon={<SendIcon />} onClick={handleOpen} fullWidth>Send</Button></Grid>
                <Grid item xs={6} sm={4}><Button variant="outlined" startIcon={<ArrowDownwardIcon />} onClick={handleReceiveOpen} fullWidth>Receive</Button></Grid>
                <Grid item xs={6} sm={4}><Button component={Link} to="/history" variant="outlined" startIcon={<HistoryIcon />} fullWidth>History</Button></Grid>
                {user.department === 'Finance' && user.role === 'Core' && (
                     <Grid item xs={6} sm={4}><Button variant="contained" color="success" startIcon={<AddCardIcon />} onClick={handleTopUpOpen} fullWidth>Top Up</Button></Grid>
                )}
                {(user.role === 'Core' || user.role === 'Finance Core') && user.department && (
                     <Grid item xs={6} sm={4}><Button variant="contained" color="secondary" startIcon={<GroupAddIcon />} onClick={handleGroupOpen} fullWidth>Send to Dept Team</Button></Grid>
                )}
            </Grid>

            {/* Recent Transactions */}
            <Typography variant="h6" align="left" gutterBottom sx={{ mt: 4 }}>Recent Transactions</Typography>
            <Paper elevation={2} sx={{ borderRadius: 2 }}>
                <List sx={{ p: 0 }}>
                    {transactions.length > 0 ? transactions.slice(0, 5).map((tx, index) => (
                        <React.Fragment key={tx.id}>
                            {(() => {
                                const isSender = tx.senderUserId === user.userId;
                                const isTopUp = tx.senderUserId === tx.receiverUserId;
                                const isDebit = isSender && !isTopUp;

                                let primaryText = '';
                                if (isDebit) {
                                    primaryText = `Sent to ${tx.receiverName}`;
                                } else if (isTopUp) {
                                    primaryText = `Wallet Top-Up`;
                                } else {
                                    primaryText = `Received from ${tx.senderName}`;
                                }

                                return (
                                    <>
                                        <ListItem>
                                            <ListItemText 
                                                primary={primaryText} 
                                                secondary={new Date(tx.createdAt).toLocaleString()} 
                                            />
                                            {/* ✅ FIXED: Changed $ to ₹ */}
                                            <Typography 
                                                color={isDebit ? 'error' : 'success.main'}
                                                sx={{ fontWeight: 'bold' }}
                                            >
                                                {isDebit ? '-' : '+'}₹{tx.amount.toFixed(2)} 
                                            </Typography>
                                        </ListItem>
                                        {index < transactions.slice(0, 5).length - 1 && <Divider />}
                                    </>
                                );
                            })()}
                        </React.Fragment>
                    )) : (<ListItem><ListItemText primary="No transactions yet." /></ListItem>)}
                </List>
            </Paper>

            {/* "Send" Modal */}
            <Modal open={open} onClose={handleClose}>
                <Box sx={modalStyle}>
                    {isScanning ? (
                      <>
                        <Typography variant="h6" component="h2" gutterBottom>Scan Recipient QR Code</Typography>
                        {/* ✅ FIXED: Updated Scanner component with better props and error handling */}
                        <Scanner 
                            onScan={handleScanResult}
                            onError={(error) => {
                                console.error('QR Scanner error:', error);
                                setMessage('Failed to scan QR code. Please try again or enter manually.');
                            }}
                            constraints={{
                                facingMode: 'environment',
                                aspectRatio: 1
                            }}
                            containerStyle={{ width: '100%' }}
                            scanDelay={300}
                        />
                        {/* ✅ FIXED: Display message during scanning */}
                        {message && (
                            <Typography 
                                sx={{ mt: 2, color: message.includes('success') ? 'success.main' : 'error.main' }}
                            >
                                {message}
                            </Typography>
                        )}
                        <Button onClick={() => { setIsScanning(false); setMessage(''); }} sx={{ mt: 2 }}>Enter Manually</Button>
                      </>
                    ) : (
                       <>
                         <Typography variant="h6" component="h2" gutterBottom>Send Money</Typography>
                         <Box component="form" onSubmit={handleSendMoney}>
                            <TextField label="Recipient's User ID" fullWidth required sx={{ mb: 2 }} value={receiverId} onChange={(e) => setReceiverId(e.target.value)} />
                            <TextField label="Amount" type="number" fullWidth required sx={{ mb: 2 }} value={amount} onChange={(e) => setAmount(e.target.value)} InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}/>
                            <Button type="submit" variant="contained" fullWidth size="large">Next</Button>
                            {message && <Typography sx={{ mt: 2, color: message.includes('success') ? 'success.main' : 'red' }}>{message}</Typography>}
                        </Box>
                        <Divider sx={{ my: 2 }}>OR</Divider>
                        <Button variant="outlined" startIcon={<QrCodeScannerIcon />} fullWidth onClick={() => setIsScanning(true)}>Scan QR Code</Button>
                      </>
                    )}
                 </Box>
            </Modal>

            {/* "Top Up" Modal */}
            <Modal open={topUpOpen} onClose={handleTopUpClose}>
                 <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" gutterBottom>Top Up Your Wallet</Typography>
                    <Box component="form" onSubmit={handleTopUp}>
                        <TextField label="Amount to Add" type="number" fullWidth required sx={{ mb: 2 }} value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}/>
                        <Button type="submit" variant="contained" color="success" fullWidth size="large">Next</Button>
                        {message && <Typography sx={{ mt: 2, color: 'red' }}>{message}</Typography>}
                    </Box>
                </Box>
            </Modal>

            {/* "Receive" Modal */}
            <Modal open={receiveOpen} onClose={handleReceiveClose}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" gutterBottom>Receive Money</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>Others can scan this code or use your User ID.</Typography>
                    <Box sx={{ p: 2, backgroundColor: 'white', display: 'inline-block', borderRadius: 1 }}>
                        <QRCode value={user.userId} size={200} />
                    </Box>
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>Your User ID: {user.userId}</Typography>
                </Box>
            </Modal>

            {/* ID Modal */}
            <Modal open={idModalOpen} onClose={handleIdClose}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" gutterBottom>User ID</Typography>
                    <Typography sx={{ mb: 2, fontWeight: 600 }}>{user.rollNumber || user.userId || 'Not Available'}</Typography>
                    <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={handleCopyId}>Copy</Button>
                </Box>
            </Modal>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={handleSnackbarClose}
                message="Copied to clipboard"
                action={<IconButton size="small" color="inherit" onClick={handleSnackbarClose}><CloseIcon fontSize="small" /></IconButton>}
            />

            {/* "Send to Dept Team" Modal */}
            <Modal open={groupOpen} onClose={handleGroupClose}>
                <Box sx={{ ...modalStyle, width: { xs: '90%', md: 600 } }}>
                    <>
                        <Typography variant="h6" gutterBottom>Send to Department Team</Typography>
                        <FormControl fullWidth sx={{ my: 2 }}>
                            <InputLabel>Select Target Role</InputLabel>
                            <Select value={targetRole} label="Select Target Role" onChange={(e) => setTargetRole(e.target.value)}>
                                <MenuItem value={'Head'}>Heads</MenuItem>
                                <MenuItem value={'Coordinator'}>Coordinators</MenuItem>
                                <MenuItem value={'Volunteer'}>Volunteers</MenuItem>
                            </Select>
                        </FormControl>

                        {groupMembers.length > 0 && (
                            <Box component="form" onSubmit={handleSendGroup}>
                                <Grid container spacing={1} alignItems="center" sx={{mb: 2}}>
                                    <Grid item xs={8}>
                                        <TextField label="Set Amount for All Selected" type="number" fullWidth size="small" value={commonAmount} onChange={e => setCommonAmount(e.target.value)} InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}/>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Button onClick={handleApplyCommonAmount} variant="outlined" size="medium" fullWidth>Apply</Button>
                                    </Grid>
                                </Grid>
                                <Paper sx={{ maxHeight: 300, overflow: 'auto', mb: 2, textAlign: 'left' }}>
                                    <List dense>
                                        {groupMembers.map(member => (
                                            <ListItem key={member.userId} divider sx={{py: 0.5}}>
                                                <FormControlLabel control={ <Checkbox checked={recipients[member.userId]?.selected || false} onChange={() => handleRecipientToggle(member.userId)} size="small"/> } label={`${member.name} (${member.userId})`} sx={{ flexGrow: 1, mr: 1 }} />
                                                <TextField label="Amount" type="number" size="small" variant="outlined" value={recipients[member.userId]?.amount || ''} onChange={(e) => handleAmountChange(member.userId, e.target.value)} sx={{ width: '100px' }} InputProps={{ inputProps: { min: 0.01, step: 0.01 } }} disabled={!recipients[member.userId]?.selected} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                                <Button type="submit" variant="contained" fullWidth>Next</Button>
                            </Box>
                        )}
                         {message && <Typography sx={{ mt: 2, color: 'red' }}>{message}</Typography>}
                    </>
                 </Box>
            </Modal>

            {/* S-PIN MODAL */}
            <Modal open={isPinModalOpen} onClose={handlePinModalClose}>
                <Box sx={modalStyle}>
                    {isSending ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                            <CircularProgress size={60} />
                            <Typography sx={{ mt: 2 }}>{message || 'Processing Transaction...'}</Typography>
                        </Box>
                    ) : (
                        <>
                            <Typography variant="h6" component="h2" gutterBottom>
                                Enter S-Pin to Confirm
                            </Typography>
                            <Box component="form" onSubmit={handleConfirmTransaction}>
                                <TextField
                                    label="S-Pin"
                                    type={showSPin ? 'text' : 'password'}
                                    fullWidth
                                    required
                                    autoFocus
                                    value={sPin}
                                    onChange={(e) => setSPin(e.target.value)}
                                    inputProps={{ 
                                        maxLength: 4, 
                                        inputMode: 'numeric', 
                                        pattern: '[0-9]*' 
                                    }}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <IconButton
                                            aria-label="toggle s-pin visibility"
                                            onClick={handleClickShowSPin}
                                            onMouseDown={handleMouseDownSPin}
                                            edge="end"
                                          >
                                            {showSPin ? <VisibilityOff /> : <Visibility />}
                                          </IconButton>
                                        </InputAdornment>
                                      ),
                                    }}
                                />
                                <Button type="submit" variant="contained" fullWidth size="large">
                                    Confirm & Pay
                                </Button>
                                {message && <Typography sx={{ mt: 2, color: 'red' }}>{message}</Typography>}
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>

            <Button variant="outlined" color="error" onClick={handleLogout} sx={{ mt: 4 }} fullWidth>Logout</Button>
        </Container>
    );
};

export default DashboardPage;