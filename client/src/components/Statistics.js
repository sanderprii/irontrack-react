import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function Statistics({ userId }) {
    const [stats, setStats] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetch(`${API_URL}/statistics?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json' },
        })
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch((err) => console.log('Error loading statistics:', err));
    }, [token]);

    // Kui stats puudub, näita laadimisolekut
    if (!stats) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6">Loading statistics...</Typography>
                </CardContent>
            </Card>
        );
    }

    // Kontrolli, et `stats.revenue` ja `stats.trainingsPerMonth` on määratud
    const revenueData = {
        labels: stats?.revenue?.map((item) => item.month) || [],
        datasets: [
            {
                label: 'Revenue',
                data: stats?.revenue?.map((item) => item.amount) || [],
                backgroundColor: 'blue',
            }
        ]
    };

    return (
        <Card sx={{ bgcolor: "background.paper" }}>
            <CardContent>
                <Typography variant="h6">Sales / Revenue</Typography>
                <Box sx={{ height: 250 }}>
                    <Bar data={revenueData} />
                </Box>
            </CardContent>
        </Card>
    );
}
