import React from 'react';
import { Container, Typography } from '@mui/material';

const TrainingDiaryPage = () => {
    return (
        <Container maxWidth={false} sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Training Diary
            </Typography>
            <Typography variant="body1">
                Here you can log your workouts, track progress, and view training history.
            </Typography>
            {/* Add your training diary functionality here */}
        </Container>
    );
};

export default TrainingDiaryPage;
