// src/components/AffiliateView.js
import React, { useState } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Button,
    Box,
    List,
    ListItem,
} from '@mui/material';
import AffiliateEdit from './AffiliateEdit';
import { uploadAffiliateLogo } from '../api/logoApi';

export default function AffiliateView({ token, affiliate, trainers, onUpdateAffiliate }) {
    const [editing, setEditing] = useState(false);

    const handleEdit = () => setEditing(true);
    const handleCancel = () => setEditing(false);

    const handleSave = async (updatedAffiliate) => {
        await onUpdateAffiliate(updatedAffiliate);
        setEditing(false);
    };

    // Funktsioon logo üleslaadimiseks
    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const result = await uploadAffiliateLogo(file, affiliate.id, token);
            // Uuenda affiliate andmeid uue logoga
            onUpdateAffiliate(result.affiliate);
        } catch (error) {
            alert(error.message);
        }
    };

    if (editing) {
        return (
            <AffiliateEdit
                affiliate={affiliate}
                trainers={trainers}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        );
    }

    return (
        <Grid container spacing={3}  >
            {/* Vasak veerg – affiliate info */}
            <Grid item xs={12} md={12}>
                <Card sx={{ bgcolor: 'background.paper' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar
                            src={affiliate.logo || 'https://via.placeholder.com/120'}
                            // Kuvatakse originaalsuurusena, aga piirame maksimaalseks mõõtmeteks 200×200
                            sx={{
                                width: '100%',
                                height: 'auto',
                                maxWidth: '200px',
                                maxHeight: '200px',
                                margin: 'auto',
                                backgroundColor: 'transparent',
                            }}
                            variant="square"
                        />
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            {affiliate.name || 'No affiliate name'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {affiliate.trainingType || 'No training type'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Button variant="contained" onClick={handleEdit}>
                                Edit
                            </Button>
                            <Button variant="outlined" component="label">
                                Upload Logo
                                <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ mt: 2, bgcolor: 'background.paper' }}>
                    <CardContent>
                        <Typography variant="h6">Contact</Typography>
                        <Typography>Email: {affiliate.email || 'No email'}</Typography>
                        <Typography>Phone: {affiliate.phone || 'No phone'}</Typography>
                        <Typography>Address: {affiliate.address || 'No address'}</Typography>
                    </CardContent>
                </Card>

                <Card sx={{ mt: 2, bgcolor: 'background.paper' }}>
                    <CardContent>
                        <Typography variant="h6">Trainers</Typography>
                        <List>
                            {trainers.length > 0 ? (
                                trainers.map((trainer) => (
                                    <ListItem key={trainer.trainerId}>{trainer.fullName}</ListItem>
                                ))
                            ) : (
                                <Typography>No trainers assigned.</Typography>
                            )}
                        </List>
                    </CardContent>
                </Card>

                <Card sx={{ mt: 2, bgcolor: 'background.paper' }}>
                    <CardContent>
                        <Typography variant="h6">Bank Details</Typography>
                        <Typography>IBAN: {affiliate.iban || 'No IBAN'}</Typography>
                        <Typography>Bank: {affiliate.bankName || 'No bank name'}</Typography>
                    </CardContent>
                </Card>
            </Grid>


        </Grid>
    );
}
