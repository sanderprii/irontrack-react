import React, { useState } from "react";
import { TextField, Button, Card, CardContent, Typography, List, ListItem, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { searchTrainers } from "../api/affiliateApi";



export default function AffiliateEdit({ affiliate, trainers, onSave, onCancel }) {

    const [form, setForm] = useState({ ...affiliate });
    const [selectedTrainers, setSelectedTrainers] = useState([...trainers]);
    const [trainerSearch, setTrainerSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRemoveTrainer = (trainerId) => {
        setSelectedTrainers(selectedTrainers.filter((t) => t.trainerId !== trainerId));
    };

    const handleTrainerSearch = async (e) => {
        const query = e.target.value;
        setTrainerSearch(query);

        if (query.length > 2) {
            const results = await searchTrainers(query);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectTrainer = (trainer) => {
        if (!selectedTrainers.some((t) => t.trainerId === trainer.id)) {
            setSelectedTrainers([...selectedTrainers, { trainerId: trainer.id, fullName: trainer.fullName, username: trainer.username }]);
        }
        setTrainerSearch("");
        setSearchResults([]);
    };

    const handleSave = () => {
        console.log("📡 Calling onSave from AffiliateEdit!");

        const updatedForm = {
            ...form,
            id: form.id || affiliate.id, // Kasuta ID-d, mis saadi `MyAffiliate.js` kaudu
            trainers: selectedTrainers.map(trainer => ({
                trainerId: trainer.trainerId,
                fullName: trainer.fullName,
                username: trainer.username
            })) // ✅ Lisa treenerid `updatedForm` objekti
        };

        console.log("✅ Updated form before sending:", updatedForm); // Kontrollimiseks logi välja
        onSave(updatedForm);
    };


    return (
        <Card sx={{ maxWidth: 600, margin: "auto", mt: 4, p: 3, bgcolor: "background.paper" }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>Edit Affiliate</Typography>
                <TextField label="Affiliate Name" name="name" fullWidth margin="normal" value={form.name} onChange={handleChange} />
                <TextField label="Address" name="address" fullWidth margin="normal" value={form.address} onChange={handleChange} />
                <TextField label="Training Type" name="trainingType" fullWidth margin="normal" value={form.trainingType} onChange={handleChange} />
                <TextField label="Email" name="email" fullWidth margin="normal" value={form.email} onChange={handleChange} />
                <TextField label="Phone" name="phone" fullWidth margin="normal" value={form.phone} onChange={handleChange} />
                <TextField label="IBAN" name="iban" fullWidth margin="normal" value={form.iban} onChange={handleChange} />
                <TextField label="Bank Name" name="bankName" fullWidth margin="normal" value={form.bankName} onChange={handleChange} />

                <Typography variant="h6" sx={{ mt: 2 }}>Search Trainers</Typography>
                <TextField label="Search" fullWidth value={trainerSearch} onChange={handleTrainerSearch} />
                <List>
                    {searchResults.map((trainer) => (
                        <ListItem key={trainer.id} button onClick={() => handleSelectTrainer(trainer)}>
                            {trainer.fullName}
                        </ListItem>
                    ))}
                </List>

                <Typography variant="h6" sx={{ mt: 2 }}>Selected Trainers</Typography>
                <List>
                    {selectedTrainers.map((trainer) => (
                        <ListItem key={trainer.trainerId} secondaryAction={
                            <IconButton edge="end" onClick={() => handleRemoveTrainer(trainer.trainerId)}>
                                <DeleteIcon />
                            </IconButton>
                        }>
                            {trainer.fullName}
                        </ListItem>
                    ))}
                </List>

                <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>Save</Button>
                <Button variant="outlined" color="secondary" onClick={onCancel} sx={{ mt: 2, ml: 2 }}>Cancel</Button>
            </CardContent>
        </Card>
    );
}
