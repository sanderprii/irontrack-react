import React from 'react';
import { Container, Typography } from '@mui/material';
import JoinUsForm from '../components/JoinUsForm';

const RegisterPage = () => {
    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Liitu meiega
            </Typography>
            <JoinUsForm />
        </Container>
    );
};

export default RegisterPage;
