import React, { useState, useEffect } from 'react';

import { Typography } from '@mui/material';

export default function Credit({ token }) {
    const [credit, setCredit] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL
    useEffect(() => {
        // laeme krediidi info
        fetch(`${API_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setCredit(data.credit);
            })
            .catch((err) => console.log('Error loading credit info:', err));
    }, [token]);

    return (
        <div>
            <Typography variant="h5">Credit</Typography>
            {credit !== null ? (
                <Typography>Your current credit is: {credit} €</Typography>
            ) : (
                <Typography>Loading...</Typography>
            )}
        </div>
    );
}
