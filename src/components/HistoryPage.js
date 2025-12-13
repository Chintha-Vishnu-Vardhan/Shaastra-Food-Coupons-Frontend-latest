// src/components/HistoryPage.js
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
    Box,
    Button
} from '@mui/material';
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
            <Typography variant="h4" gutterBottom>
                Transaction History
            </Typography>
            <Button component={RouterLink} to="/dashboard" variant="outlined" sx={{ mb: 2 }}>
                Back to Dashboard
            </Button>
            <Paper elevation={3}>
                <List sx={{ p: 0 }}>
                    {transactions.length > 0 ? (
                        transactions.map((tx, index) => (
                            <React.Fragment key={tx.id}>
                                {(() => {
                                    const isSender = tx.senderUserId === user.userId;
                                    const isTopUp = tx.senderUserId === tx.receiverUserId;
                                    const isDebit = isSender && !isTopUp;

                                    let primaryText = '';
                                    if (isDebit) {
                                        primaryText = `Sent to ${tx.receiverName} (${tx.receiverUserId})`;
                                    } else if (isTopUp) {
                                        primaryText = `Wallet Top-Up`;
                                    } else {
                                        primaryText = `Received from ${tx.senderName} (${tx.senderUserId})`;
                                    }

                                    return (
                                        <>
                                            <ListItem>
                                                <ListItemText
                                                    primary={primaryText}
                                                    secondary={new Date(tx.createdAt).toLocaleString()}
                                                />
                                                {/* ✅ FIXED: Changed $ to ₹ and strip any currency symbols from database */}
                                                <Typography
                                                    color={isDebit ? 'error' : 'success.main'}
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    {isDebit ? '-' : '+'}₹{parseFloat(String(tx.amount).replace(/[^0-9.-]/g, '')).toFixed(2)}
                                                </Typography>
                                            </ListItem>
                                            {index < transactions.length - 1 && <Divider />}
                                        </>
                                    );
                                })()}
                            </React.Fragment>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="You have no transaction history." />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Container>
    );
};

export default HistoryPage;