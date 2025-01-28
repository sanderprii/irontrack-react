import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { getClassLeaderboard } from "../api/leaderboardApi";

export default function LeaderboardModal({ open, onClose, classId }) {
    const [leaderboard, setLeaderboard] = useState([]); // ✅ Alustame tühja massiiviga
    const [filter, setFilter] = useState("all"); // Default: Show all results

    useEffect(() => {
        if (open && classId) {
            fetchLeaderboard();
        }
    }, [open, classId]);

    const fetchLeaderboard = async () => {
        try {
            const response = await getClassLeaderboard(classId);
            setLeaderboard(response || []); // ✅ Kui response on undefined/null, siis määrame tühja massiivi
        } catch (error) {
            console.error("❌ Error fetching leaderboard:", error);
            setLeaderboard([]); // ✅ Veakäsitluse korral tagame, et massiiv oleks tühi, mitte undefined
        }
    };

    const handleFilterChange = (event, newFilter) => {
        if (newFilter) {
            setFilter(newFilter);
        }
    };

    const filteredLeaderboard = (leaderboard || []).filter(entry => // ✅ Kui leaderboard on undefined, määrame tühja massiivi
        filter === "all" || entry.scoreType?.toLowerCase() === filter
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Leaderboard</DialogTitle>
            <DialogContent>
                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={handleFilterChange}
                    aria-label="Filter results"
                    sx={{ mb: 2 }}
                >
                    <ToggleButton value="all">All</ToggleButton>
                    <ToggleButton value="rx">Rx</ToggleButton>
                    <ToggleButton value="sc">Sc</ToggleButton>
                    <ToggleButton value="beg">Beg</ToggleButton>
                </ToggleButtonGroup>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Place</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Score</TableCell>
                                <TableCell>Type</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredLeaderboard.length > 0 ? (
                                filteredLeaderboard.map((entry, index) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{entry.fullName}</TableCell>
                                        <TableCell>{entry.score}</TableCell>
                                        <TableCell>{entry.scoreType?.toUpperCase()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No results available.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Close</Button>
            </DialogActions>
        </Dialog>
    );
}
