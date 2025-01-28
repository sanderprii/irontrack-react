import React from 'react';
import { Container, Typography } from '@mui/material';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
    return (
        <Container  sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Logi sisse
            </Typography>
            <LoginForm />
        </Container>
    );
};

export default LoginPage;
