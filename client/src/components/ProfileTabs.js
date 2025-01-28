import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

const ProfileTabs = ({ selectedTab, onTabChange }) => {
    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedTab} onChange={onTabChange} variant="scrollable" scrollButtons="auto">
                <Tab label="Profile" />
                <Tab label="Visit History" />
                <Tab label="Credit" />
                <Tab label="Purchase History" />
                <Tab label="Active Plans" />
                <Tab label="Statistics" />
            </Tabs>
        </Box>
    );
};

export default ProfileTabs;
