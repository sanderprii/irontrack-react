import React from 'react';
import { Container, Typography } from '@mui/material';

const HomePage = () => {
    return (
        <Container maxWidth={false} sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Tere tulemast avalehele!
            </Typography>
            <Typography variant="body1">
               no tere
            </Typography>
        </Container>
    );
};

export default HomePage;
