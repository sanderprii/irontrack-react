import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, Button, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const RoleSelectionPage = () => {
    const navigate = useNavigate();
    const { token, setRole } = useContext(AuthContext);
    const [affiliateOwner, setAffiliateOwner] = useState(false);
    const [isTrainer, setIsTrainer] = useState(false);
    const [error, setError] = useState('');
    const API_URL = process.env.REACT_APP_API_URL
    useEffect(() => {
        // Laeme /api/auth/me



        fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            credentials: 'include',
            headers: {

                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setAffiliateOwner(data.affiliateOwner);
                    setIsTrainer(!!data.isTrainer);

                }
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to load user info');
            });
    }, [navigate, token]);

    const handleRoleSelect = (role) => {

        setRole(role);

        if (role === 'regular') {
            // Tavaline kasutaja (pole owner, trainer)
            navigate('/training-diary');
        } else if (role === 'affiliate') {
            navigate('/affiliate-owner');
        } else if (role === 'trainer') {
            alert('Trainer page not implemented yet');
        } else if (role === 'checkin') {
            alert('Check-in page not implemented yet');
        }
    };

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Select Your Role
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300 }}>
                {/* Regular user on alati valikus, kui see on su default */}
                <Button variant="contained" color="primary" onClick={() => handleRoleSelect('regular')}>
                    Regular User
                </Button>

                {/* Kuvame Affiliate Owner ja Check-In valiku AINULT, kui affiliateOwner = true */}
                {affiliateOwner && (
                    <>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleRoleSelect('affiliate')}
                        >
                            Affiliate Owner
                        </Button>
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={() => handleRoleSelect('checkin')}
                        >
                            Check-in
                        </Button>
                    </>
                )}

                {/* Kuvame Trainer valiku ainult siis, kui isTrainer = true (serveri andmebaas) */}
                {isTrainer && (
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleRoleSelect('trainer')}
                    >
                        Trainer
                    </Button>
                )}
            </Box>
        </Container>
    );
};

export default RoleSelectionPage;
