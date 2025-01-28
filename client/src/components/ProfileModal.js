import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import ProfileView from "./ProfileView";

export default function ProfileModal({ open, onClose, user }) {
    if (!user) return null; // Kui kasutaja puudub, ära kuva midagi

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{user.fullName}'s Profile</DialogTitle>
            <DialogContent>
                <ProfileView user={user} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Close</Button>
            </DialogActions>
        </Dialog>
    );
}
