import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Checkbox, FormControlLabel } from "@mui/material";

export default function PlanFormModal({ open, onClose, onSave, plan }) {
    const [form, setForm] = useState({ name: "", validityDays: "", price: "", sessions: "", additionalData: "" });

    useEffect(() => {
        if (plan) {
            setForm(plan);
        } else {
            setForm({ name: "", validityDays: "", price: "", sessions: "", additionalData: "" });
        }
    }, [plan]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (e) => {
        setForm({ ...form, sessions: e.target.checked ? 9999 : "" });
    };

    const handleSubmit = () => {
        onSave(form);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>{plan ? "Edit Plan" : "Add Plan"}</DialogTitle>
            <DialogContent>
                <TextField label="Plan Name" name="name" fullWidth margin="normal" value={form.name} onChange={handleChange} />
                <TextField label="Validity Period (Days)" name="validityDays" type="number" fullWidth margin="normal" value={form.validityDays} onChange={handleChange} />
                <TextField label="Price (€)" name="price" type="number" step="0.01" fullWidth margin="normal" value={form.price} onChange={handleChange} />
                <TextField label="Number of Sessions" name="sessions" type="number" fullWidth margin="normal" value={form.sessions} onChange={handleChange} disabled={form.sessions === 9999} />
                <FormControlLabel control={<Checkbox checked={form.sessions === 9999} onChange={handleCheckboxChange} />} label="Unlimited Sessions" />
                <TextField label="Additional Data" name="additionalData" multiline rows={3} fullWidth margin="normal" value={form.additionalData} onChange={handleChange} />
            </DialogContent>
            <DialogActions>
                {plan && <Button color="error" onClick={() => onSave(null)}>Delete</Button>}
                <Button onClick={handleSubmit} color="primary">Save</Button>
                <Button onClick={onClose} color="secondary">Close</Button>
            </DialogActions>
        </Dialog>
    );
}
