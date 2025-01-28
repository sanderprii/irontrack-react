import React from 'react';
import {Card, CardContent, Typography, Button, Avatar, Box, Divider, Stack} from '@mui/material';

export default function ProfileView({user, onEditProfile, onChangePassword, onUploadProfilePicture}) {

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onUploadProfilePicture(file);
        }
    };

    const role = localStorage.getItem("role");

    return (
        <Card sx={{maxWidth: 600, mx: 'auto', boxShadow: 3, borderRadius: 3, backgroundColor: 'background.paper'}}>
            <CardContent sx={{textAlign: 'center', p: 4}}>
                {role === "regular" ? (
                    <>
                        <Avatar
                            src={user?.logo || "https://via.placeholder.com/120"}
                            sx={{
                                width: 150,
                                height: 150,
                                borderRadius: '50%', // Muudab profiilipildi ringiks
                                objectFit: 'cover',
                                margin: 'auto',
                            }}
                        />
                        <Button variant="outlined" component="label" sx={{ mt: 2 }}>
                            Upload Profile Picture
                            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                        </Button>
                        <Divider sx={{ my: 2 }} />

                        <Stack spacing={1} sx={{ textAlign: 'left' }}>
                            <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
                            {user.phone && <Typography variant="body1"><strong>Phone:</strong> {user.phone}</Typography>}
                            {user.location && <Typography variant="body1"><strong>Location:</strong> {user.location}</Typography>}
                        </Stack>


                    </>
                ) : (
                    <>


                        <Divider sx={{ my: 2 }} />

                        <Stack spacing={1} sx={{ textAlign: 'left' }}>
                            <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
                            {user.phone && <Typography variant="body1"><strong>Phone:</strong> {user.phone}</Typography>}
                            {user.location && <Typography variant="body1"><strong>Location:</strong> {user.location}</Typography>}
                        </Stack>


                    </>
                )}
        </CardContent>
</Card>
)
    ;
}
