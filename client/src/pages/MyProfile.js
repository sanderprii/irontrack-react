import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, changeUserPassword } from '../api/profileApi';
import { uploadProfilePicture } from '../api/logoApi';
import { Container, Grid, Card, CardContent, Typography, Box, Avatar, Button, Drawer, List, ListItem, ListItemText, IconButton, Toolbar, CircularProgress } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Statistics from '../components/Statistics';
import PurchaseHistory from '../components/PurchaseHistory';
import ActivePlans from '../components/ActivePlans';
import ProfileEdit from '../components/ProfileEdit';
import ChangePassword from '../components/ChangePassword';
import ProfileView from "../components/ProfileView";
import CreditView from "../components/CreditView";


const menuItems = [
    { id: 'my-profile', label: 'My Profile', component: ProfileView },
    { id: 'statistics', label: 'Statistics', component: Statistics },
    { id: 'purchase-history', label: 'Purchase History', component: PurchaseHistory },
    { id: 'active-plans', label: 'Active Plans', component: ActivePlans },
    { id: 'edit-profile', label: 'Edit Profile', component: ProfileEdit },
    { id: 'change-password', label: 'Change Password', component: ChangePassword },
    { id: 'credit', label: 'Credit', component: CreditView },
];

export default function MyProfile({ token }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // ✅ Lisame laadimisoleku
    const [activeComponent, setActiveComponent] = useState('my-profile');
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (token) {
            getUserProfile(token)
                .then((data) => {
                    setUser(data);
                    setIsLoading(false); // ✅ Kui andmed on saadud, lõpetame laadimise
                })
                .catch((error) => {
                    console.error('Error fetching user profile:', error);
                    setIsLoading(false); // ✅ Vea korral lõpetame ka laadimise
                });
        }
    }, [token]);

    const handleUploadProfilePicture = async (file) => {
        try {
            const updatedUser = await uploadProfilePicture(file, user.id, token);
            setUser(updatedUser);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleMenuClick = (componentId) => {
        setActiveComponent(componentId);
        setDrawerOpen(false);
    };

    const handleSaveProfile = async (updatedUser) => {
        const success = await updateUserProfile(updatedUser, token);
        if (success) {
            setUser(updatedUser);
            setActiveComponent('my-profile');
        } else {
            alert('Failed to update profile');
        }
    };

    const handleChangePassword = async (passwordData) => {
        const success = await changeUserPassword(passwordData, token);
        if (success) {
            alert('Password changed successfully!');
            setActiveComponent('my-profile');
        } else {
            alert('Failed to change password.');
        }
    };

    const ActiveComponent = menuItems.find(item => item.id === activeComponent)?.component || ProfileView;

    return (
        <Container maxWidth={false} sx={{ mt: 4, display: 'flex', backgroundColor: 'background.default'  }}>
            {/* Sidebar Navigation */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: 240,
                    flexShrink: 0,
                    position: "relative !important",
                }}
                PaperProps={{
                    sx: {
                        position: "relative",
                    }
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
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ display: { md: 'none' }, position: 'fixed', top: 64, right: 30, zIndex: 1300 }}>
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
            <Box sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.paper' }}>
                <Card sx={{ backgroundColor: 'background.paper' }}>
                    <CardContent>
                        {/* ✅ Kui `isLoading` on true, näita laadijat */}
                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
                                <CircularProgress />
                            </Box>
                        ) : activeComponent === 'edit-profile' ? (
                            <ProfileEdit user={user} onSave={handleSaveProfile} onCancel={() => setActiveComponent('my-profile')} />
                        ) : activeComponent === 'change-password' ? (
                            <ChangePassword onChangePassword={handleChangePassword} onCancel={() => setActiveComponent('my-profile')} />
                        ) : (
                            <ActiveComponent token={token} user={user} userId={user?.id} onUploadProfilePicture={handleUploadProfilePicture} />,
                            <ActiveComponent token={token} user={user} userId={user?.id} onUploadProfilePicture={handleUploadProfilePicture}/>

                    )}
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}
