import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

export default function ChangePassword({ onChangePassword, onCancel }) {
    const [pw, setPw] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setPw({ ...pw, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (pw.newPassword !== pw.confirmPassword) {
            alert('New passwords do not match.');
            return;
        }
        onChangePassword(pw);
    };

    return (
        <Box>
            <TextField
                label="Old Password"
                name="oldPassword"
                type="password"
                value={pw.oldPassword}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
            />
            <TextField
                label="New Password"
                name="newPassword"
                type="password"
                value={pw.newPassword}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
            />
            <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={pw.confirmPassword}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 2 }}
            />

            <Button variant="contained" onClick={handleSubmit}>
                Change Password
            </Button>
            <Button variant="outlined" color="error" onClick={onCancel} sx={{ ml: 2 }}>
                Cancel
            </Button>
        </Box>
    );
}
