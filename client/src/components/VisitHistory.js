import React, { useState, useEffect } from 'react';

import { Table, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material';

export default function VisitHistory({ token }) {
    const [visits, setVisits] = useState([]);
    const API_URL = process.env.REACT_APP_API_URL
    useEffect(() => {
        // laeme külastusajaloo
        fetch(`${API_URL}/user/user-visit-history`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setVisits(data);
            })
            .catch((err) => console.log('Error loading visits:', err));
    }, [token]);

    return (
        <div>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Visit History
            </Typography>
            {visits.length === 0 ? (
                <Typography>No visits found.</Typography>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Class</TableCell>
                            <TableCell>Check-in</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visits.map((v) => (
                            <TableRow key={v.id}>
                                <TableCell>
                                    {new Date(v.classSchedule.time).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{v.classSchedule.trainingName}</TableCell>
                                <TableCell>{v.checkIn ? 'Yes' : 'No'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
