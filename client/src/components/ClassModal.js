import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Grid,
    Box,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LeaderboardModal from "./LeaderboardModal";
import ProfileModal from "./ProfileModal";

// ✅ impordi uued API-funktsioonid
import {
    getClassAttendees,
    checkInAttendee,
    deleteAttendee,
} from "../api/classesApi";
import {
    getUserClassScore,
    addClassScore,
    updateClassScore,
    registerForClass,
    cancelRegistration,
    checkUserEnrollment,
} from "../api/classesApi";
import { getUserPlansByAffiliate } from "../api/profileApi";
import { getMemberInfo } from "../api/membersApi";
import TextareaAutosize from "@mui/material/TextareaAutosize";

export default function ClassModal({
                                       open,
                                       onClose,
                                       cls,
                                       onEdit,
                                       onDelete,
                                       refreshClasses,
                                       attendeesCount,
    props
                                   }) {
    const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isProfileOpen, setProfileOpen] = useState(false);

    // 👉 Registreerimiseks vajalikud uued state'id
    const [userPlans, setUserPlans] = useState([]); // Hoiustab kasutaja plaane
    const [selectedPlanId, setSelectedPlanId] = useState(null); // Kasutaja valitud plaani ID

    const [showScoreForm, setShowScoreForm] = useState(false);
    const [scoreType, setScoreType] = useState("rx");  // rx | sc | beg
    const [scoreValue, setScoreValue] = useState("");
    const [hasScore, setHasScore] = useState(false);

    // Aitame tuvastada, kas kasutaja on *juba* registreerunud sellesse klassi
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem("role");
        setUserRole(role);
    }, []);

    // Kui modal avatakse ja meil on olemas klassi ID, toome klassi osalejad
    // ja uurime, kas kasutaja on nende hulgas.
    useEffect(() => {
        if (!cls || !cls.id) return;
        fetchAttendees();
    }, [cls]);

    useEffect(() => {
        if (cls && cls.id && userRole === "regular" && open) {
            fetchUserScore(cls.id);
        }
    }, [cls, userRole, open]);

    // Kui kasutaja roll on "regular" ja modal avatakse, toome kasutaja plaanid
    useEffect(() => {
        if (open && userRole === "regular" && cls?.affiliateId) {
            loadUserPlans(cls.affiliateId);
        }
    }, [open, userRole, cls]);

    // 3) LAEME KASUTAJA SCORE, et teha kindlaks, kas on juba sisestatud
    async function fetchUserScore(classId) {
        try {
            const result = await getUserClassScore(classId);
            // Oletame, et API tagastab { hasScore: true/false, scoreType: "...", score: "..." }
            if (result.hasScore) {
                setHasScore(true);
                setScoreType(result.scoreType || "rx");
                setScoreValue(result.score || "");
            } else {
                setHasScore(false);
                setScoreType("rx");
                setScoreValue("");
            }
        } catch (error) {
            console.error("Error fetching user score:", error);
        }
    }

    // 4) SALVESTA / UUENDA SKOOR
    async function handleSaveScore() {
        try {
            if (!scoreValue || !scoreType) {
                alert("Please fill the score and scoreType!");
                return;
            }

            if (!cls || !cls.id) {
                console.error("No classId found!");
                return;
            }

            // Kas loome uue kirje või uuendame?
            if (hasScore) {
                // Uuenda
                await updateClassScore(cls.id, scoreType, scoreValue);
            } else {
                // Lisa uus
                await addClassScore(cls.id, scoreType, scoreValue);
            }

            alert("Score saved successfully!");
            setShowScoreForm(false);
            setHasScore(true);

        } catch (error) {
            console.error("Error saving score:", error);
            alert("Failed to save score");
        }
    }


    async function loadUserPlans(affiliateId) {
        try {
            const plans = await getUserPlansByAffiliate(affiliateId);

            // Filtreeri välja plaanid, mille endDate + 5 päeva on möödas
            const filteredPlans = plans.filter(plan => {
                const planEndDate = new Date(plan.endDate).getTime();
                const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000; // 5 päeva millisekundites
                const expiryTime = planEndDate + fiveDaysInMs;
                return Date.now() < expiryTime;
            });

            setUserPlans(filteredPlans);

            if (filteredPlans.length > 0) {
                // Kui on vähemalt üks kehtiv plaan, pane esimene vaikimisi valituks
                setSelectedPlanId(filteredPlans[0].id);
            }
        } catch (error) {
            console.error("Error loading user plans:", error);
        }
    }


    async function fetchAttendees() {
        try {
            await checkIfCurrentUserIsRegistered();
            const data = await getClassAttendees(cls.id);
            setAttendees(data || []);

            console.log(isRegistered)
        } catch (error) {
            console.error("Error fetching attendees:", error);
            setAttendees([]);
        }
    }

    async function checkIfCurrentUserIsRegistered() {
        const response = await checkUserEnrollment(cls.id);

        setIsRegistered(response.enrolled);

    }

    // ✅ Registreerimise funktsioon
    const handleRegister = async () => {
        try {
            if (!selectedPlanId) {
                alert("Please select a plan first!");
                return;
            }
            await registerForClass(cls.id, selectedPlanId);
            // Kui õnnestub, uuendame osalejate nimekirja
            await fetchAttendees();

            // Uuendame peal vaadet, kui vaja (attendeesCount, vms)
            await refreshClasses();
        } catch (error) {
            console.error("Error registering for class:", error);
            alert(error.message || "Registration failed");
        }
    };

    // ✅ Tühista registreerimise funktsioon
    const handleCancelRegistration = async () => {
        try {
            await cancelRegistration(cls.id);
            await fetchAttendees();

            await refreshClasses();

        } catch (error) {
            console.error("Error canceling registration:", error);
            alert(error.message || "Cancellation failed");
        }
    };

    const handleCheckIn = async (userId) => {
        await checkInAttendee(cls.id, userId);
        setAttendees((prev) =>
            prev.map((a) => (a.userId === userId ? { ...a, checkIn: true } : a))
        );
    };

    const handleDelete = async (userId) => {
        await deleteAttendee(cls.id, userId);
        setAttendees((prev) => prev.filter((a) => a.userId !== userId));
        refreshClasses();
    };

    const handleOpenProfile = async (userId) => {
        try {
            const userData = await getMemberInfo(userId);
            setSelectedUser(userData);
            setProfileOpen(true);
        } catch (error) {
            console.error("❌ Error fetching user profile:", error);
        }
    };
    if (!cls) return null;

   const isClassOver = new Date(cls.time) < new Date();
console.log(new Date(cls.time))
    console.log(new Date())


    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle
                sx={{ textAlign: "center", fontSize: "1.8rem", fontWeight: "bold" }}
            >
                {cls.trainingName}
            </DialogTitle>

            <DialogContent>
                {/* Põhiinfo sektsioon */}
                <Grid container spacing={3} sx={{ paddingY: 2 }}>
                    {/* Vasak veerg */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                backgroundColor: "background.paper",
                                padding: 2,
                                borderRadius: "8px",
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: "bold", marginBottom: 1 }}
                            >
                                Class Details
                            </Typography>
                            <Typography>
                                <strong>🕒 Time:</strong>{" "}
                                {new Date(cls.time).toLocaleString()}
                            </Typography>
                            <Typography>
                                <strong>🏋️ Trainer:</strong> {cls.trainer || "N/A"}
                            </Typography>
                            <Typography>
                                <strong>📍 Location:</strong> {cls.location || "N/A"}
                            </Typography>
                            <Typography>
                                <strong>👥 Capacity:</strong> {attendeesCount} /{" "}
                                {cls.memberCapacity}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Parem veerg */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                backgroundColor: "background.paper",
                                padding: 2,
                                borderRadius: "8px",
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: "bold", marginBottom: 1 }}
                            >
                                Workout Info
                            </Typography>
                            <Typography sx={{ fontWeight: "bold", color: "text.primary" }}>
                                <strong>🔥{cls.wodName || "None"}</strong>
                            </Typography>
                            <Typography  sx={{ color: "secondary.main", mb: 1, fontStyle: "italic" }}>
                                <strong>{cls.wodType || "None"}</strong>
                            </Typography>
                            <Typography sx={{ color: "text.secondary", whiteSpace: "pre-line" }} >
                                <strong></strong>{" "}
                                {cls.description || "No description available"}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ marginY: 2 }} />

                {/* Register / Cancel sektsioon ainult REGULAR kasutajale */}
                {userRole === "regular" && (
                    <Box mb={2}>
                        {isRegistered ? (
                            // ✅ Kui kasutaja on registreeritud, siis näitame Cancel-nuppu
                            <Button
                                variant="contained"
                                color="error"
                                disabled={isClassOver}
                                onClick={handleCancelRegistration}
                            >
                                Cancel Registration
                            </Button>
                        ) : (
                            // ✅ Kui kasutaja EI OLE registreeritud, näitame plaanide dropdowni + Register-nuppu
                            <>
                                {userPlans && userPlans.length > 0 ? (
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <FormControl sx={{ minWidth: 120 }}>
                                            <InputLabel id="plan-select-label">Select Plan</InputLabel>
                                            <Select
                                                labelId="plan-select-label"
                                                value={selectedPlanId || ""}
                                                label="Select Plan"
                                                onChange={(e) => setSelectedPlanId(e.target.value)}
                                            >
                                                {userPlans.map((plan) => (
                                                    <MenuItem key={plan.id} value={plan.id}>
                                                        {plan.name} (Sessions left: {plan.sessionsLeft})
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            disabled={isClassOver}
                                            onClick={handleRegister}
                                        >
                                            Register
                                        </Button>
                                    </Box>
                                ) : (
                                    // ✅ Kui plaane pole
                                    <Typography color="red">
                                        You have no valid plans.{" "}
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => alert("Go to buy plans page!")}
                                        >
                                            Buy Plans
                                        </Button>
                                    </Typography>
                                )}
                            </>
                        )}
                    </Box>
                )}

                {/* Osalejate sektsioon */}
                {(userRole === "affiliate" || userRole === "trainer") && (
                    <>
                <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
                    Attendees
                </Typography>
                <List>
                    {attendees?.length > 0 ? (
                        attendees.map((attendee) => (
                            <ListItem
                                key={attendee.userId}
                                sx={{
                                    border: "2px solid #ddd",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    marginBottom: "8px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                {/* Full Name */}
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: "bold",
                                                textTransform: "uppercase",
                                                cursor: "pointer",
                                                color: "blue",
                                                "&:hover": { textDecoration: "underline" },
                                            }}
                                            onClick={() => handleOpenProfile(attendee.userId)}
                                        >
                                            {attendee.fullName}
                                        </Typography>
                                    }
                                />

                                {/* Nupud (check-in & kustuta) on nähtavad nt treenerile, adminile vms,
                    kui soovid, piira rolli. */}
                                <ListItemSecondaryAction
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                    }}
                                >
                                    <IconButton
                                        onClick={() => handleCheckIn(attendee.userId)}
                                        disabled={attendee.checkIn}
                                        sx={{
                                            backgroundColor: attendee.checkIn ? "green" : "#ddd",
                                            color: attendee.checkIn ? "white" : "black",
                                            borderRadius: "50%",
                                            "&:hover": {
                                                backgroundColor: attendee.checkIn ? "darkgreen" : "#bbb",
                                            },
                                            "&.Mui-disabled": {
                                                backgroundColor: "green",
                                                color: "white",
                                            },
                                        }}
                                    >
                                        <CheckCircleIcon />
                                    </IconButton>

                                    <IconButton
                                        onClick={() => handleDelete(attendee.userId)}
                                        sx={{
                                            border: "2px solid red",
                                            borderRadius: "8px",
                                            padding: "5px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <DeleteIcon sx={{ color: "red" }} />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))
                    ) : (
                        <Typography>No attendees</Typography>
                    )}
                </List>
</>
            )}
                {userRole === "regular" &&  (
                    <Box mb={2}>
                        {!showScoreForm && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setShowScoreForm(true)}
                                sx={{ mr: 2 }}
                            >
                                {hasScore ? "Edit Score" : "Add Score"}
                            </Button>
                        )}

                        {/* 6) Kui showScoreForm === true -> kuvame sisestusväljad */}
                        {showScoreForm && (
                            <Box
                                sx={{
                                    mb: 2,
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    p: 2,
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    {hasScore ? "Edit Your Score" : "Add Your Score"}
                                </Typography>

                                {/* RADIO GROUP scoreType jaoks (rx, sc, beg) */}
                                <RadioGroup
                                    row
                                    value={scoreType}
                                    onChange={(e) => setScoreType(e.target.value)}
                                    sx={{ mb: 2 }}
                                >
                                    <FormControlLabel value="rx" control={<Radio />} label="RX" />
                                    <FormControlLabel value="sc" control={<Radio />} label="Scaled" />
                                    <FormControlLabel value="beg" control={<Radio />} label="Beginner" />
                                </RadioGroup>

                                {/* Tekstiväli skoori jaoks */}
                                <TextField
                                    label="Your Score"
                                    variant="outlined"
                                    value={scoreValue}
                                    onChange={(e) => setScoreValue(e.target.value)}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                />

                                {/* SAVE + CANCEL nupud */}
                                <Box>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={handleSaveScore}
                                        sx={{ mr: 2 }}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => setShowScoreForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: "space-between", padding: "16px" }}>
                <Button onClick={() => setLeaderboardOpen(true)} color="primary" variant="outlined">
                    Leaderboard
                </Button>

                {/* Ainult mitte-regular näevad Edit / Delete */}
                {userRole !== "regular" && (
                    <>
                        <Button onClick={() => onEdit(cls)} color="primary" variant="contained">
                            Edit
                        </Button>
                        <Button onClick={() => onDelete(cls.id)} color="error" variant="contained">
                            Delete
                        </Button>
                    </>
                )}

                <Button onClick={onClose} color="secondary" variant="contained">
                    Close
                </Button>
            </DialogActions>

            <LeaderboardModal
                open={isLeaderboardOpen}
                onClose={() => setLeaderboardOpen(false)}
                classId={cls.id}
            />
            <ProfileModal
                open={isProfileOpen}
                onClose={() => setProfileOpen(false)}
                user={selectedUser}
            />
        </Dialog>
    );
}
