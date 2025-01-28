import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Typography, Card, CardContent } from '@mui/material';

export default function PurchaseHistory({ userId }) {
    const [purchases, setPurchases] = useState([]); // ✅ Algseis on tühi massiiv

    const token = localStorage.getItem('token');
    const API_URL = process.env.REACT_APP_API_URL
    useEffect(() => {
        console.log(userId)
        fetch(`${API_URL}/user/user-purchase-history?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json' },
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setPurchases(data); // ✅ Kui API tagastab massiivi, siis salvesta
                } else {
                    setPurchases([]); // ✅ Kui API vastus pole massiiv, pane tühi massiiv
                }
            })
            .catch((err) => {
                console.error('Error loading purchase history:', err);
                setPurchases([]); // ✅ Vea korral määrame tühja massiivi
            });
    }, [token]);

    return (
        <Card sx={{ bgcolor: "background.paper" }}>
            <CardContent>
                <Typography variant="h6">Products</Typography>
                {purchases.length > 0 ? ( // ✅ Kontrollime, kas on vähemalt üks ost
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>License</TableCell>
                                <TableCell>Sales</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {purchases.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.planName}</TableCell>
                                    <TableCell>Single License</TableCell>
                                    <TableCell>{p.price} €</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Typography sx={{ textAlign: "center", mt: 2 }}>
                        No purchase history available.
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
