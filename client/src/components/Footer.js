import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
    return (
        <Box component="footer" sx={{ p: 2, textAlign: 'center', marginTop: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Minu Äpp. Kõik õigused kaitstud.
            </Typography>
        </Box>
    );
};

export default Footer;
