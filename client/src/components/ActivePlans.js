import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Typography, Card } from '@mui/material';

export default function ActivePlans({ userId }) {
    const [plans, setPlans] = useState([]);

    const token = localStorage.getItem('token');
    const API_URL = process.env.REACT_APP_API_URL
    useEffect(() => {
        fetch(`${API_URL}/user/user-purchase-history?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json' },
        })
            .then((res) => res.json())
            .then((data) => {
                const now = new Date();
                // filtrime välja kehtivad plaanid
                const active = data.filter((p) => new Date(p.endDate) >= now);
                setPlans(active);
            })
            .catch((err) => console.log('Error loading active plans:', err));
    }, [token]);

    return (
        <Card sx={{ bgcolor: "background.paper" }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Active Plans
            </Typography>
            {plans.length === 0 ? (
                <Typography>No active plans.</Typography>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Plan</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Sessions Left</TableCell>
                            <TableCell>Price</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plans.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.planName}</TableCell>
                                <TableCell>{new Date(p.purchasedAt).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(p.endDate).toLocaleDateString()}</TableCell>
                                <TableCell>{p.sessionsLeft}</TableCell>
                                <TableCell>{p.price} €</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Card>
    );
}
