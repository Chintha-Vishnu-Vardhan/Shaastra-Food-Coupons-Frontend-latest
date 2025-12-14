// src/components/HistoryPage.js
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Divider,
    CircularProgress,
    Box,
    Button,
    Chip
} from '@mui/material';
import { 
    CallReceived, 
    CallMade, 
    AddCard,
    ArrowBack
} from '@mui/icons-material';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const HistoryPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const fetchData = async () => {
            try {
                const historyRes = await api.get('/api/wallet/history');
                setTransactions(historyRes.data);
                setError('');
            } catch (err) {
                setError('Failed to fetch transaction history.');
                console.error("HistoryPage fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, isAuthenticated]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, pb: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    Please log in to view your transaction history.
                </Typography>
                <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 2 }}>
                    Go to Login
                </Button>
            </Container>
        );
    }

    if (error) {
       return (
            <Container maxWidth="md" sx={{ mt: 4, pb: 4, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
                 <Button component={RouterLink} to="/dashboard" variant="outlined" sx={{ mt: 2 }}>
                    Back to Dashboard
                </Button>
            </Container>
       );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button 
                    component={RouterLink} 
                    to="/dashboard" 
                    startIcon={<ArrowBack />}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                    Transaction History
                </Typography>
            </Box>

            <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <List sx={{ p: 0 }}>
                    {transactions.length > 0 ? (
                        transactions.map((tx, index) => (
                            <React.Fragment key={tx.id}>
                                {(() => {
                                    // Determine Transaction Type
                                    // Check strictly if self-transfer (backend sets sender=receiver for topup)
                                    // OR if the special senderUserId 'FINANCE_TOPUP' is used
                                    const isTopUp = (tx.senderId === tx.receiverId) || (tx.senderUserId === 'FINANCE_TOPUP');
                                    const isSender = tx.senderUserId === user.userId;
                                    const isDebit = isSender && !isTopUp;

                                    let primaryText = '';
                                    let secondaryText = '';
                                    let IconComponent = null;
                                    let avatarColor = '';
                                    let amountColor = '';

                                    if (isTopUp) {
                                        primaryText = 'Wallet Top-Up';
                                        secondaryText = 'Credit added to wallet';
                                        IconComponent = AddCard;
                                        avatarColor = '#7c4dff'; // Deep Purple for Top Up
                                        amountColor = '#7c4dff';
                                    } else if (isDebit) {
                                        primaryText = `Sent to ${tx.receiverName}`;
                                        secondaryText = `ID: ${tx.receiverUserId}`;
                                        IconComponent = CallMade;
                                        avatarColor = '#ff5252'; // Red for Sent
                                        amountColor = '#d32f2f';
                                    } else {
                                        primaryText = `Received from ${tx.senderName}`;
                                        secondaryText = `ID: ${tx.senderUserId}`;
                                        IconComponent = CallReceived;
                                        avatarColor = '#4caf50'; // Green for Received
                                        amountColor = '#2e7d32';
                                    }

                                    return (
                                        <ListItem sx={{ py: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: avatarColor }}>
                                                    <IconComponent />
                                                </Avatar>
                                            </ListItemAvatar>
                                            
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight="600">
                                                            {primaryText}
                                                        </Typography>
                                                        {isTopUp && (
                                                            <Chip 
                                                                label="TOP UP" 
                                                                size="small" 
                                                                sx={{ 
                                                                    height: 20, 
                                                                    fontSize: '0.65rem', 
                                                                    fontWeight: 'bold',
                                                                    bgcolor: '#ede7f6',
                                                                    color: '#673ab7'
                                                                }} 
                                                            />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography variant="body2" component="span" display="block" color="text.secondary">
                                                            {secondaryText}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.disabled">
                                                            {new Date(tx.createdAt).toLocaleString('en-IN', {
                                                                month: 'short', day: 'numeric', 
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                            
                                            <Typography
                                                variant="h6"
                                                sx={{ 
                                                    fontWeight: 'bold', 
                                                    color: amountColor,
                                                    minWidth: '80px',
                                                    textAlign: 'right'
                                                }}
                                            >
                                                {isDebit ? '-' : '+'}₹{parseFloat(String(tx.amount).replace(/[^0-9.-]/g, '')).toFixed(2)}
                                            </Typography>
                                        </ListItem>
                                    );
                                })()}
                                {index < transactions.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))
                    ) : (
                        <ListItem sx={{ py: 4, justifyContent: 'center' }}>
                            <ListItemText 
                                primary="No transactions yet" 
                                secondary="Your activity will appear here"
                                sx={{ textAlign: 'center' }}
                            />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Container>
    );
};

export default HistoryPage;