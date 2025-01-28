import React, { useState, useEffect } from "react";
import {
    Container, Typography, Button, Box, TextField, Select, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Grid
} from "@mui/material";
import { getOrders, getFinanceData } from "../api/financeApi";
import {getOwnerAffiliateId} from "../api/membersApi";

export default function Finance() {
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("0");
    const [activeTab, setActiveTab] = useState("orders");
    const [affiliateId, setAffiliateId] = useState(null); // ✅ Affiliate ID

    // 📌 Finance andmed
    const [revenue, setRevenue] = useState(0);
    const [activeMembers, setActiveMembers] = useState(0);
    const [expiredMembers, setExpiredMembers] = useState(0);
    const [totalMembers, setTotalMembers] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchAffiliateId(); // ✅ Võtab affiliate ID
    }, []);

    useEffect(() => {
        if (affiliateId) {
            fetchOrders();
            fetchFinance();
        }
    }, [affiliateId, startDate, endDate]);

    const fetchAffiliateId = async () => {
        try {
            const response = await getOwnerAffiliateId();
            setAffiliateId(response.affiliateId || null);
        } catch (error) {
            console.error("❌ Error fetching affiliate ID:", error);
        }
    };

    const fetchOrders = async () => {
        if (!affiliateId) return;
        try {
            const response = await getOrders(affiliateId);
            if (!Array.isArray(response)) {
                console.error("❌ API ERROR: Orders response is not an array", response);
                setOrders(Array.isArray(response) ? response : []);
            } else {
                setOrders(response || []);
            }
        } catch (error) {
            console.error("❌ Error fetching orders:", error);
            setOrders([]);
        }
    };

    const fetchFinance = async () => {
        if (!affiliateId) return;
        try {
            const params = new URLSearchParams();
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            params.append("affiliateId", affiliateId); // ✅ Lisatud affiliateId

            const response = await getFinanceData(params);

            if (response) {
                setRevenue(response.revenue || 0);
                setActiveMembers(response.activeMembers || 0);
                setExpiredMembers(response.expiredMembers || 0);
                setTotalMembers(response.totalMembers || 0);
            }
        } catch (error) {
            console.error("❌ Error fetching finance data:", error);
        }
    };

    const handleSearchChange = (event) => setSearchQuery(event.target.value || "");
    const handleSortChange = (event) => setSortBy(event.target.value);

    const handleDateFilter = (e) => {
        e.preventDefault();
        fetchFinance();
    };

    const handleLastYear = () => {
        const lastYear = new Date().getFullYear() - 1;
        setStartDate(`${lastYear}-01-01`);
        setEndDate(`${lastYear}-12-31`);
        fetchFinance();
    };

    const handleCurrentYear = () => {
        const currentYear = new Date().getFullYear();
        setStartDate(`${currentYear}-01-01`);
        setEndDate(`${currentYear}-12-31`);
        fetchFinance();
    };

    const filteredOrders = (orders || []).filter(order =>
        ((order?.user?.fullName ?? "").includes(searchQuery)) ||
        ((order?.planName ?? "").includes(searchQuery))
    );
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        switch (sortBy) {
            case "1": return a.planName.localeCompare(b.planName);
            case "2": return b.price - a.price;
            case "3": return new Date(b.purchasedAt) - new Date(a.purchasedAt);
            default: return a.user.fullName.localeCompare(b.user.fullName);
        }
    });

    return (
        <Container maxWidth={false}>
            <Box textAlign="center" my={4}>
                <Typography variant="h5" color="primary">Finance</Typography>
            </Box>

            {/* ✅ Nuppude sektsioon */}
            <Box display="flex" justifyContent="center" mb={3}>
                <Button
                    variant={activeTab === "orders" ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => setActiveTab("orders")}
                    sx={{ mx: 1 }}
                >
                    Orders History
                </Button>
                <Button
                    variant={activeTab === "finance" ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => setActiveTab("finance")}
                    sx={{ mx: 1 }}
                >
                    Finance
                </Button>
            </Box>

            {/* ✅ Orders History */}
            {activeTab === "orders" && (
                <Box my={3}>
                    <Typography variant="h6">Orders History</Typography>
                    <TextField label="Search by user or plan..." fullWidth onChange={handleSearchChange} margin="normal" />
                    <Select value={sortBy} onChange={handleSortChange} fullWidth>
                        <MenuItem value="0">Sort by User</MenuItem>
                        <MenuItem value="1">Sort by Plan</MenuItem>
                        <MenuItem value="2">Sort by Price</MenuItem>
                        <MenuItem value="3">Sort by Purchased Date</MenuItem>
                    </Select>

                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Plan</TableCell>
                                    <TableCell>Price (€)</TableCell>
                                    <TableCell>Purchased At</TableCell>
                                    <TableCell>Valid Until</TableCell>
                                    <TableCell>Sessions Left</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.user.fullName}</TableCell>
                                        <TableCell>{order.planName}</TableCell>
                                        <TableCell>€{order.price.toFixed(2)}</TableCell>
                                        <TableCell>{new Date(order.purchasedAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(order.endDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{order.sessionsLeft}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* ✅ Finance Section */}
            {activeTab === "finance" && (
                <Box my={4}>
                    <Typography variant="h6">Financial Summary</Typography>

                    <form onSubmit={handleDateFilter}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={6}>
                                <TextField
                                    label="Start Date"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="End Date"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </Grid>
                        </Grid>

                        <Box display="flex" justifyContent="flex-end" mt={2}>
                            <Button onClick={handleLastYear} variant="outlined" sx={{ mr: 1 }}>Last Year</Button>
                            <Button onClick={handleCurrentYear} variant="outlined" sx={{ mr: 1 }}>Current Year</Button>
                            <Button type="submit" variant="contained">Update</Button>
                        </Box>
                    </form>

                    <Typography>Total Revenue: <strong>€{revenue.toFixed(2)}</strong></Typography>
                    <Typography>Active Members: <strong>{activeMembers}</strong></Typography>
                    <Typography>Expired Members: <strong>{expiredMembers}</strong></Typography>
                    <Typography>Total Members: <strong>{totalMembers}</strong></Typography>
                </Box>
            )}
        </Container>
    );
}
