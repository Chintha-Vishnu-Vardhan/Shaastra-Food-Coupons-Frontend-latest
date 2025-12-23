// src/components/HistoryPage.js - WITH TABLE VIEW + AUTO-REFRESH
import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container, Typography, Paper, List, ListItem, ListItemAvatar, Avatar,
    ListItemText, Divider, CircularProgress, Box, Button, Chip, TextField,
    Grid, FormControl, InputLabel, Select, MenuItem, Pagination, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TableSortLabel, IconButton, Tooltip, Badge
} from '@mui/material';
import { 
    CallReceived, CallMade, AddCard, ArrowBack, Search, FilterList,
    Refresh, ViewList, ViewModule
} from '@mui/icons-material';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const HistoryPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, isAuthenticated } = useAuth();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);

    // Search & Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [txType, setTxType] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // ✅ NEW: View Mode (card/table)
    const [viewMode, setViewMode] = useState(() => {
        const saved = localStorage.getItem('historyViewMode');
        return saved || 'card';
    });

    // ✅ NEW: Auto-refresh
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const autoRefreshIntervalRef = useRef(null);
    const isScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef(null);

    // ✅ NEW: Table sorting
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Save view mode preference
    useEffect(() => {
        localStorage.setItem('historyViewMode', viewMode);
    }, [viewMode]);

    // Detect scrolling (pause auto-refresh)
    useEffect(() => {
        const handleScroll = () => {
            isScrollingRef.current = true;
            
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            
            scrollTimeoutRef.current = setTimeout(() => {
                isScrollingRef.current = false;
            }, 2000);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    const fetchTransactions = async (silent = false) => {
        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const params = {
                page: currentPage,
                limit: 20
            };

            if (searchQuery) params.search = searchQuery;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (txType) params.type = txType;

            const historyRes = await api.get('/api/wallet/history', { params });
            
            setTransactions(historyRes.data.transactions || historyRes.data);
            
            if (historyRes.data.pagination) {
                setTotalPages(historyRes.data.pagination.totalPages);
                setTotalTransactions(historyRes.data.pagination.totalTransactions);
            } else {
                setTransactions(historyRes.data);
            }
            
            setError('');
            setLastUpdated(Date.now());
        } catch (err) {
            setError('Failed to fetch transaction history.');
            console.error("HistoryPage fetch error:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [currentPage, user, isAuthenticated]);

    // ✅ AUTO-REFRESH: 3s for Vendors, 30s for others
    useEffect(() => {
        if (!user) return;

        const isVendor = user.role === 'Vendor';
        const refreshInterval = isVendor ? 3000 : 30000; // 3s or 30s

        autoRefreshIntervalRef.current = setInterval(() => {
            // Only refresh if not scrolling
            if (!isScrollingRef.current) {
                fetchTransactions(true); // Silent refresh
            }
        }, refreshInterval);

        return () => {
            if (autoRefreshIntervalRef.current) {
                clearInterval(autoRefreshIntervalRef.current);
            }
        };
    }, [user, currentPage, searchQuery, startDate, endDate, txType]);

    const handleApplyFilters = () => {
        setCurrentPage(1);
        fetchTransactions();
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        setTxType('');
        setCurrentPage(1);
        setTimeout(fetchTransactions, 100);
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleManualRefresh = () => {
        fetchTransactions();
    };

    // ✅ TABLE SORTING
    const handleSort = (column) => {
        const isAsc = sortBy === column && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setSortBy(column);
    };

    const sortedTransactions = React.useMemo(() => {
        const sorted = [...transactions];
        sorted.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            if (sortBy === 'createdAt') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }
            
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
        return sorted;
    }, [transactions, sortBy, sortOrder]);

    const getTimeSinceUpdate = () => {
        const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m ago`;
    };

    if (loading && transactions.length === 0) {
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

    if (error && transactions.length === 0) {
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
        <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Button 
                    component={RouterLink} 
                    to="/dashboard" 
                    startIcon={<ArrowBack />}
                    sx={{ mr: 2 }}
                >
                    Back
                </Button>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, flexGrow: 1 }}>
                    Transaction History
                </Typography>
                
                {/* ✅ VIEW MODE TOGGLE */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                    <Tooltip title="Card View">
                        <IconButton 
                            onClick={() => setViewMode('card')}
                            color={viewMode === 'card' ? 'primary' : 'default'}
                        >
                            <ViewModule />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Table View">
                        <IconButton 
                            onClick={() => setViewMode('table')}
                            color={viewMode === 'table' ? 'primary' : 'default'}
                        >
                            <ViewList />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* ✅ MANUAL REFRESH */}
                <Tooltip title={`Last updated: ${getTimeSinceUpdate()}`}>
                    <IconButton 
                        onClick={handleManualRefresh}
                        disabled={isRefreshing}
                    >
                        <Badge 
                            badgeContent={user?.role === 'Vendor' ? 'LIVE' : null}
                            color="success"
                        >
                            <Refresh className={isRefreshing ? 'spin' : ''} />
                        </Badge>
                    </IconButton>
                </Tooltip>

                <Button 
                    variant="outlined" 
                    startIcon={<FilterList />}
                    onClick={() => setShowFilters(!showFilters)}
                    size="small"
                >
                    {showFilters ? 'Hide' : 'Filters'}
                </Button>
            </Box>

            {/* Filter Panel */}
            {showFilters && (
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>Search & Filter</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Search by name/ID"
                                fullWidth
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter name or user ID"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Transaction Type</InputLabel>
                                <Select
                                    value={txType}
                                    label="Transaction Type"
                                    onChange={(e) => setTxType(e.target.value)}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="sent">Sent</MenuItem>
                                    <MenuItem value="received">Received</MenuItem>
                                    <MenuItem value="topup">Top-Up</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="From Date & Time"
                                type="datetime-local"
                                fullWidth
                                size="small"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="To Date & Time"
                                type="datetime-local"
                                fullWidth
                                size="small"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button 
                                    variant="contained" 
                                    onClick={handleApplyFilters}
                                    fullWidth
                                >
                                    Apply Filters
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    onClick={handleClearFilters}
                                    fullWidth
                                >
                                    Clear All
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Transaction Count */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    {totalTransactions > 0 ? `Showing ${transactions.length} of ${totalTransactions} transactions` : 'No transactions found'}
                </Typography>
                {(searchQuery || startDate || endDate || txType) && (
                    <Chip 
                        label="Filtered" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        onDelete={handleClearFilters}
                    />
                )}
            </Box>

            {/* ✅ CONDITIONAL RENDERING: Card View or Table View */}
            {viewMode === 'card' ? (
                // CARD VIEW (Mobile-friendly)
                <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                    <List sx={{ p: 0 }}>
                        {sortedTransactions.length > 0 ? (
                            sortedTransactions.map((tx, index) => {
                                const isTopUp = (tx.senderId === tx.receiverId) || (tx.senderUserId === 'FINANCE_TOPUP');
                                const isSender = tx.senderUserId === user.userId;
                                const isDebit = isSender && !isTopUp;

                                let primaryText = '', secondaryText = '', IconComponent = null, avatarColor = '', amountColor = '';

                                if (isTopUp) {
                                    primaryText = 'Wallet Top-Up';
                                    secondaryText = 'Credit added to wallet';
                                    IconComponent = AddCard;
                                    avatarColor = '#7c4dff';
                                    amountColor = '#7c4dff';
                                } else if (isDebit) {
                                    primaryText = `Sent to ${tx.receiverName}`;
                                    secondaryText = `ID: ${tx.receiverUserId}`;
                                    IconComponent = CallMade;
                                    avatarColor = '#ff5252';
                                    amountColor = '#d32f2f';
                                } else {
                                    primaryText = `Received from ${tx.senderName}`;
                                    secondaryText = `ID: ${tx.senderUserId}`;
                                    IconComponent = CallReceived;
                                    avatarColor = '#4caf50';
                                    amountColor = '#2e7d32';
                                }

                                return (
                                    <React.Fragment key={tx.id}>
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
                                            
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{ 
                                                        fontWeight: 'bold', 
                                                        color: amountColor,
                                                        minWidth: '80px'
                                                    }}
                                                >
                                                    {isDebit ? '-' : '+'}₹{parseFloat(String(tx.amount).replace(/[^0-9.-]/g, '')).toFixed(2)}
                                                </Typography>
                                                {tx.balanceAfter && (
                                                    <Typography variant="caption" color="text.disabled">
                                                        Bal: ₹{tx.balanceAfter.toFixed(2)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </ListItem>
                                        {index < sortedTransactions.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <ListItem sx={{ py: 4, justifyContent: 'center' }}>
                                <ListItemText 
                                    primary="No transactions found" 
                                    secondary={
                                        (searchQuery || startDate || endDate || txType) 
                                            ? "Try adjusting your filters"
                                            : "Your activity will appear here"
                                    }
                                    sx={{ textAlign: 'center' }}
                                />
                            </ListItem>
                        )}
                    </List>
                </Paper>
            ) : (
                // ✅ TABLE VIEW (Desktop)
                <TableContainer component={Paper} sx={{ borderRadius: 3, mb: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                                    <TableSortLabel
                                        active={sortBy === 'createdAt'}
                                        direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                                        onClick={() => handleSort('createdAt')}
                                        sx={{ color: 'white !important', '& .MuiTableSortLabel-icon': { color: 'white !important' } }}
                                    >
                                        Date & Time
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>From/To ID</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 600 }}>From/To Name</TableCell>
                                <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Debit</TableCell>
                                <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Credit</TableCell>
                                <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Balance Now</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedTransactions.length > 0 ? (
                                sortedTransactions.map((tx) => {
                                    const isTopUp = (tx.senderId === tx.receiverId) || (tx.senderUserId === 'FINANCE_TOPUP');
                                    const isSender = tx.senderUserId === user.userId;
                                    const isDebit = isSender && !isTopUp;

                                    let fromToId = '', fromToName = '', debit = '', credit = '';

                                    if (isDebit) {
                                        fromToId = tx.receiverUserId;
                                        fromToName = tx.receiverName;
                                        debit = tx.amount.toFixed(2);
                                    } else {
                                        fromToId = isTopUp ? 'FINANCE_TOPUP' : tx.senderUserId;
                                        fromToName = isTopUp ? 'System Top-Up' : tx.senderName;
                                        credit = tx.amount.toFixed(2);
                                    }

                                    return (
                                        <TableRow key={tx.id} hover>
                                            <TableCell>
                                                {new Date(tx.createdAt).toLocaleString('en-IN', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit'
                                                })}
                                            </TableCell>
                                            <TableCell>{fromToId}</TableCell>
                                            <TableCell>{fromToName}</TableCell>
                                            <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>
                                                {debit ? `-₹${debit}` : '-'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                                                {credit ? `+₹${credit}` : '-'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                {tx.balanceAfter ? `₹${tx.balanceAfter.toFixed(2)}` : '-'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination 
                        count={totalPages} 
                        page={currentPage} 
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            )}

            {/* ✅ CSS for spinning refresh icon */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </Container>
    );
};

export default HistoryPage;