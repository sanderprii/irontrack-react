import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import WODSearch from './WODSearch';

const TrainingForm = ({ token }) => {
    const [selectedWOD, setSelectedWOD] = useState(null);

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Add Training</Typography>

            <WODSearch onSelectWOD={setSelectedWOD} token={token} />

            {selectedWOD && (
                <Typography sx={{ mt: 2 }}>
                    Selected WOD: <strong>{selectedWOD.name}</strong>
                </Typography>
            )}

            <TextField label="Score" fullWidth sx={{ mt: 2 }} />
            <Button variant="contained" sx={{ mt: 2 }}>Save Training</Button>
        </Box>
    );
};

export default TrainingForm;
