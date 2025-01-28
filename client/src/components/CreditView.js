// src/components/CreditView.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { getUserCredits, getCreditHistory, addCredit } from '../api/creditApi';

const CreditView = ({ user, affiliateId }) => {
    // Algväärtused on tühjad massiivid
    const [credits, setCredits] = useState([]);
    const [creditHistory, setCreditHistory] = useState([]);
    const [openRow, setOpenRow] = useState(null);
    const [creditInputs, setCreditInputs] = useState({});

    // Laadime kasutaja krediidi andmed
    useEffect(() => {
        const fetchCredits = async () => {
            try {
                // Veendu, et mõlemad parameetrid on antud
                const data = await getUserCredits(affiliateId, user.id);
                // Kui data ei ole massiiv, kasuta fallback väärtust []
                setCredits(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching credits", error);
                setCredits([]);
            }
        };
        fetchCredits();
    }, [affiliateId, user.id]);

    // Laadime krediidi ajalugu
    useEffect(() => {
        const fetchCreditHistory = async () => {
            try {
                const data = await getCreditHistory(affiliateId, user.id);
                setCreditHistory(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching credit history", error);
                setCreditHistory([]);
            }
        };
        fetchCreditHistory();
    }, [affiliateId, user.id]);

    const handleToggleAdd = (creditId) => {
        if (openRow === creditId) {
            setOpenRow(null);
        } else {
            setOpenRow(creditId);
            setCreditInputs((prev) => ({
                ...prev,
                [creditId]: { amount: '', description: '' }
            }));
        }
    };

    const handleInputChange = (creditId, field, value) => {
        setCreditInputs((prev) => ({
            ...prev,
            [creditId]: {
                ...prev[creditId],
                [field]: value
            }
        }));
    };

    const handleAddCredit = async (creditId, affiliateId) => {
        const inputs = creditInputs[creditId];
        const amount = parseFloat(inputs.amount);
        const description = inputs.description;
        if (isNaN(amount)) {
            alert("Please enter a valid amount");
            return;
        }
        try {
            await addCredit(user.id, affiliateId, amount, description);
            // Värskendame andmeid pärast edukat API vastust
            const updatedCredits = await getUserCredits(affiliateId, user.id);
            setCredits(Array.isArray(updatedCredits) ? updatedCredits : []);
            const updatedHistory = await getCreditHistory(affiliateId, user.id);
            setCreditHistory(Array.isArray(updatedHistory) ? updatedHistory : []);
            setOpenRow(null);
        } catch (error) {
            console.error("Error adding credit", error);
        }
    };

    const role = localStorage.getItem('role');

    // Lisamise funktsiooni võib kasutada ainult, kui kasutaja roll on affiliate või trainer
    const canAddCredit = role === 'affiliate' || role === 'trainer';

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Credit
            </Typography>
            <Paper sx={{ mb: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Credit Amount</TableCell>
                            <TableCell>Affiliate</TableCell>
                            {canAddCredit && <TableCell>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {credits.map((credit) => (
                            <React.Fragment key={credit.id}>
                                <TableRow>
                                    <TableCell>{credit.credit}€</TableCell>
                                    <TableCell>{credit.affiliate?.name}</TableCell>
                                    {canAddCredit && (
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                startIcon={<AddCircleIcon />}
                                                onClick={() => handleToggleAdd(credit.id)}
                                            >
                                                Add Credit
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                                {openRow === credit.id && (
                                    <TableRow>
                                        <TableCell colSpan={canAddCredit ? 3 : 2}>
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                                                <TextField
                                                    label="Amount"
                                                    type="number"
                                                    value={creditInputs[credit.id]?.amount || ''}
                                                    onChange={(e) => handleInputChange(credit.id, 'amount', e.target.value)}
                                                />
                                                <TextField
                                                    label="Description"
                                                    value={creditInputs[credit.id]?.description || ''}
                                                    onChange={(e) => handleInputChange(credit.id, 'description', e.target.value)}
                                                />
                                                <Button variant="contained" onClick={() => handleAddCredit(credit.id, credit.affiliateId)}>
                                                    Apply
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
            <Typography variant="h6" gutterBottom>
                Credit History
            </Typography>
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Payment Ref</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {creditHistory.map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCell>
                                    {new Date(entry.createdAt).toLocaleDateString('et-EE', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </TableCell>
                                <TableCell>{entry.paymentRef}</TableCell>
                                <TableCell>{entry.description}</TableCell>
                                <TableCell>
                                    {entry.decrease ? '-' : '+'}{entry.creditAmount}€
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default CreditView;
