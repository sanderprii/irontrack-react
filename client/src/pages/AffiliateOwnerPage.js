import React from 'react';
import { Container, Typography } from '@mui/material';

const AffiliateOwnerPage = () => {
    return (
        <Container maxWidth={false} sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Affiliate owner page
            </Typography>
            <Typography variant="body1">
                Here you can manage your affiliate, view statistics, and manage users.
            </Typography>
            {/* Add your training diary functionality here */}
        </Container>
    );
};

export default AffiliateOwnerPage;
