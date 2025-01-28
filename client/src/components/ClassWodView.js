import React, { useState, useEffect } from "react";
import { Container, Box, Typography, Button, Grid, Card, CardContent, Divider } from "@mui/material";
import { getWeekWODs, applyWODToTrainings } from "../api/wodApi";
import WODModal from "./WODModal";

export default function ClassWodView({ affiliateId, onClose }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekWODs, setWeekWODs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isWODModalOpen, setWODModalOpen] = useState(false);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    useEffect(() => {
        if (affiliateId) fetchWeekWODs();
    }, [affiliateId, currentDate]);

    const fetchWeekWODs = async () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() || 7) + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        try {
            const response = await getWeekWODs(affiliateId, startOfWeek);
            setWeekWODs(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching weekly WODs:", error);
            setWeekWODs([]);
        }
    };

    const handlePrevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const handleOpenWODModal = (date) => {
        setSelectedDate(date);
        setWODModalOpen(true);
    };

    const handleApplyWOD = async (date) => {
        await applyWODToTrainings(affiliateId, date);
        fetchWeekWODs();
    };

    return (
        <Container>
            {/* Pealkiri ja nupud */}
            <Box textAlign="center" my={4}>
                <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main" }}>
                    Weekly WODs
                </Typography>
                <Box display="flex" justifyContent="center" gap={2} my={2}>
                    <Button variant="contained" color="secondary" onClick={handlePrevWeek}>
                        Previous Week
                    </Button>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {new Date(currentDate).toLocaleDateString("en-GB")}
                    </Typography>
                    <Button variant="contained" color="secondary" onClick={handleNextWeek}>
                        Next Week
                    </Button>
                </Box>

            </Box>

            {/* WOD-de kuvamine päevade kaupa */}
            <Grid container spacing={3}>
                {dayNames.map((day, index) => {
                    const dayDate = new Date(currentDate);
                    dayDate.setDate(dayDate.getDate() - (dayDate.getDay() || 7) + 1 + index);

                    const wod = weekWODs.find(w => new Date(w.date).toDateString() === dayDate.toDateString());

                    return (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{ bgcolor: "background.paper", p: 2, borderRadius: "12px", boxShadow: 3 }}>
                                <CardContent>
                                    {/* Päeva nimi ja kuupäev */}
                                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1, color: "primary.main", textAlign: "center" }}>
                                        {day} - {dayDate.toLocaleDateString("en-GB")}
                                    </Typography>

                                    <Divider sx={{ mb: 2 }} />

                                    {/* WOD Andmed */}
                                    {wod ? (
                                        <Box textAlign="center">
                                            <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary" }}>
                                                {wod.wodName}
                                            </Typography>
                                            <Typography variant="subtitle2" sx={{ color: "secondary.main", mb: 1, fontStyle: "italic" }}>
                                                {wod.type}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "pre-line" }}>
                                                {wod.description}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary" textAlign="center">
                                            No WOD added
                                        </Typography>
                                    )}

                                    {/* Nupud */}
                                    <Box mt={3} display="flex" justifyContent="space-between">
                                        <Button size="small" variant="outlined" color="primary" onClick={() => handleOpenWODModal(dayDate)}>
                                            + Add WOD
                                        </Button>
                                        {wod && (
                                            <Button size="small" variant="contained" color="secondary" onClick={() => handleApplyWOD(dayDate)}>
                                                Apply WOD
                                            </Button>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* WOD lisamise modal */}
            <WODModal
                open={isWODModalOpen}
                onClose={() => setWODModalOpen(false)}
                selectedDate={selectedDate}
                selectedAffiliateId={affiliateId}
                refreshWODs={fetchWeekWODs}
            />
        </Container>
    );
}
