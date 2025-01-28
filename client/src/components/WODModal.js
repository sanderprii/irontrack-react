import React, { useState, useEffect, useCallback } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import TextareaAutosize from '@mui/material/TextareaAutosize';
import WODSearch from "./WODSearch";
import { getTodayWOD, saveTodayWOD } from "../api/wodApi";

export default function WODModal({ open, onClose, selectedDate, selectedAffiliateId, refreshWODs }) {
    const [wod, setWod] = useState({ wodName: "", type: "For Time", description: "" });
    const [showSearch, setShowSearch] = useState(true);
    const wodTypes = ["For Time", "EMOM", "TABATA", "AMRAP"]; // ✅ WOD tüübid dropdowni jaoks

    const loadTodayWOD = useCallback(async () => {
        try {
            const response = await getTodayWOD(selectedAffiliateId, selectedDate);
            if (response) {
                setWod({
                    wodName: response.wodName || "",
                    type: response.type || "For Time",
                    description: response.description || "",
                });
            } else {
                setWod({ wodName: "", type: "For Time", description: "" });
            }
        } catch (error) {
            console.error("Error loading WOD:", error);
        }
    }, [selectedAffiliateId, selectedDate]);

    useEffect(() => {
        if (open && selectedDate) {
            loadTodayWOD();
            setShowSearch(true);
        }
    }, [open, selectedDate, loadTodayWOD]);

    const handleSaveWOD = async () => {
        try {
            const formattedDate = new Date(selectedDate).toISOString().split("T")[0];

            const wodPayload = {
                affiliateId: selectedAffiliateId,
                wodName: wod.wodName.toUpperCase(),
                wodType: wod.type,
                description: wod.description,
                date: formattedDate,
            };



            await saveTodayWOD(selectedAffiliateId, wodPayload);
            loadTodayWOD();
            refreshWODs();
            onClose();
        } catch (error) {
            console.error("❌ Error saving WOD:", error);
        }
    };

    const handleSelectWOD = (selectedWOD) => {
        setWod({
            wodName: selectedWOD.name || "",
            type: selectedWOD.type || "For Time",
            description: selectedWOD.description || "",
        });
        setShowSearch(false); // ✅ Peida otsing pärast valimist
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{wod.wodName ? "Edit WOD" : "Add WOD"}</DialogTitle>
            <DialogContent>
                {showSearch && <WODSearch onSelectWOD={handleSelectWOD} />}
                <TextField
                    label="WOD Name"
                    fullWidth
                    value={wod.wodName}
                    onChange={(e) => setWod({ ...wod, wodName: e.target.value })}
                    margin="normal"
                />

                {/* ✅ WOD Type as Dropdown */}
                <FormControl fullWidth margin="normal">
                    <InputLabel>WOD Type</InputLabel>
                    <Select
                        value={wod.type || "For Time"}
                        onChange={(e) => setWod({ ...wod, type: e.target.value })}
                    >
                        {wodTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextareaAutosize
                    minRows={3} // ✅ Algne kõrgus
                    maxRows={10} // ✅ Ei lähe suuremaks kui 10 rida
                    placeholder="Description"
                    style={{ width: "100%", fontSize: "16px", padding: "8px" }}
                    value={wod.description}
                    onChange={(e) => setWod({ ...wod, description: e.target.value })}
                />

            </DialogContent>
            <DialogActions>
                <Button onClick={handleSaveWOD} color="primary">Save</Button>
                <Button onClick={onClose} color="secondary">Close</Button>
            </DialogActions>
        </Dialog>
    );
}
