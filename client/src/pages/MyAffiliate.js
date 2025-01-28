// src/pages/MyAffiliate.js
import React, { useState, useEffect } from 'react';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Avatar,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Toolbar,
    CircularProgress,
    Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { getAffiliate, updateAffiliate } from '../api/affiliateApi';
import AffiliateView from '../components/AffiliateView';

const menuItems = [
    { id: 'my-affiliate', label: 'My Affiliate', component: AffiliateView },
];

export default function MyAffiliate({ token }) {
    const [affiliate, setAffiliate] = useState(null);
    const [trainers, setTrainers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeComponent, setActiveComponent] = useState('my-affiliate');
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (token) {
            getAffiliate(token)
                .then((data) => {
                    setAffiliate(data.affiliate || {});
                    setTrainers(data.trainers || []);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching affiliate:', error);
                    setIsLoading(false);
                });
        }
    }, [token]);

    const handleMenuClick = (componentId) => {
        setActiveComponent(componentId);
        setDrawerOpen(false);
    };

    const handleUpdateAffiliate = async (updatedAffiliate) => {
        const success = await updateAffiliate(updatedAffiliate, token);
        if (success) {
            setAffiliate(updatedAffiliate);
            setActiveComponent('my-affiliate');
        } else {
            alert('Failed to update affiliate');
        }
    };

    const ActiveComponent =
        menuItems.find((item) => item.id === activeComponent)?.component ||
        AffiliateView;

    return (
        <Container maxWidth={false} sx={{ mt: 4, display: 'flex' }}>
            {/* Sidebar Navigation */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: 240,
                    flexShrink: 0,
                    position: 'relative !important',
                }}
                PaperProps={{
                    sx: {
                        position: 'relative',
                    },
                }}
            >
                <Box sx={{ width: 220, p: 2 }}>

                    <List>
                        {menuItems.map((item) => (
                            <ListItem button key={item.id} onClick={() => handleMenuClick(item.id)}>
                                <ListItemText primary={item.label} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            {/* Mobile Menu Button */}
            <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                    display: { md: 'none' },
                    position: 'fixed',
                    top: 64,
                    right: 30,
                    zIndex: 1300,
                }}
            >
                <MenuIcon />
            </IconButton>

            {/* Mobile Drawer */}
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Toolbar />
                <Box sx={{ width: 240, p: 2 }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem button key={item.id} onClick={() => handleMenuClick(item.id)}>
                                <ListItemText primary={item.label} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, pt: 2 }}>
                <Card>
                    <CardContent>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <ActiveComponent
                                token={token}
                                affiliate={affiliate}
                                trainers={trainers}
                                onUpdateAffiliate={handleUpdateAffiliate}
                            />
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}
