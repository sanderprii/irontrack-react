import React from 'react';
import { Container, Typography } from '@mui/material';

const FindUsersPage = () => {
    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Tere tulemast avalehele!
            </Typography>
            <Typography variant="body1">
                findusers
            </Typography>
        </Container>
    );
};

export default FindUsersPage;
