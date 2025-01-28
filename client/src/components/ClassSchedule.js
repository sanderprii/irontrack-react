import React from "react";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // ⏰ Kellaaeg
import PersonIcon from "@mui/icons-material/Person"; // 👤 Treener
import GroupIcon from "@mui/icons-material/Group"; // 👥 Mahutavus

export default function ClassSchedule({ classes, attendeesCount, onClassClick, weeklyView }) {
    // ✅ Sorteerime klassid ajaliselt (varasemad eespool)
    const sortedClasses = [...classes].sort((a, b) => new Date(a.time) - new Date(b.time));

    return (
        <Box sx={{ width: "100%" }}>
            {sortedClasses.length === 0 ? (
                <Typography
                    variant={weeklyView ? "body2" : "h6"}
                    align="center"
                    sx={{ width: "100%", mt: 2 }}
                >
                    No trainings scheduled.
                </Typography>
            ) : (
                sortedClasses.map((cls) => (
                    <Card
                        key={cls.id}
                        sx={{
                            cursor: "pointer",
                            ":hover": { boxShadow: 6 },
                            bgcolor: "background.paper",
                            width: "100%",
                            mb: 2, // Lisame väikese vahe iga klassi vahele
                            p: weeklyView ? 1 : 2, // Weekly vaates väiksem padding
                        }}
                        onClick={() => onClassClick(cls)}
                    >
                        <CardContent>
                            {weeklyView ? (
                                // ✅ Päevavaade (KAHE VEERUGA)
                                <Grid container spacing={2} alignItems="center">
                                    {/* Vasak veerg: Kellaaeg ja kestus */}
                                    <Grid item xs={3}>
                                        <Box display="flex" alignItems="center">
                                            <AccessTimeIcon sx={{ mr: 1 }} />
                                            <Typography>
                                                {new Date(cls.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </Typography>
                                        </Box>
                                        <Typography color="textSecondary">{cls.duration} min</Typography>
                                    </Grid>

                                    {/* Parem veerg: Klass, Treener, Mahutavus */}
                                    <Grid item xs={9}>
                                        <Typography variant="h6">{cls.trainingName}</Typography>

                                        <Box display="flex" alignItems="center">
                                            <PersonIcon sx={{ mr: 1 }} />
                                            <Typography>{cls.trainer || "N/A"}</Typography>
                                        </Box>

                                        <Box display="flex" alignItems="center">
                                            <GroupIcon sx={{ mr: 1 }} />
                                            <Typography>
                                                {attendeesCount[cls.id] || 0} / {cls.memberCapacity} spots
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            ) : (
                                // ✅ Nädalavaade (ÜHE VEERUGA)
                                <Box display="flex" flexDirection="column" alignItems="center">
                                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", fontSize: "0.65rem" }}>
                                        {cls.trainingName}
                                    </Typography>

                                    <Box display="flex" alignItems="center" sx={{ fontSize: "0.65rem", mt: 0.5 }}>
                                        <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                        <Typography variant="body2" sx={{ fontSize: "0.65rem"}}>
                                            {new Date(cls.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" sx={{ fontSize: "0.65rem", mt: 0.5 }}>
                                        <PersonIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                        <Typography variant="body2" sx={{ fontSize: "0.65rem"}}>{cls.trainer || "N/A"}</Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" sx={{ fontSize: "0.65rem", mt: 0.5 }}>
                                        <GroupIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                        <Typography variant="body2" sx={{ fontSize: "0.65rem"}}>
                                            {attendeesCount[cls.id] || 0} / {cls.memberCapacity} spots
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
}
