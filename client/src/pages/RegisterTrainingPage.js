import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    TextField,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    Grid,
    Card,
    CardContent,
    CardActions,
    Divider
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import GroupsIcon from "@mui/icons-material/Groups";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

import { styled } from "@mui/material/styles";
import {
    fetchAffiliates,
    fetchAffiliateInfo,
    addHomeAffiliate,
    removeHomeAffiliate,
    fetchPlans,
    checkHomeAffiliate
} from "../api/getClassesApi";

import {getUserPlansByAffiliate} from "../api/profileApi";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AppTheme from "../shared-theme/AppTheme";

const StyledContainer = styled(Container)(({ theme }) => ({
    pt: { xs: 4, sm: 12 },
    pb: { xs: 8, sm: 16 },
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(4),
    backgroundColor: theme.palette.background.default,
}));

const StyledCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    textAlign: "center",
    backgroundColor: theme.palette.background.paper,
    transition: "0.3s",
    "&:hover": {
        boxShadow: theme.shadows[5],
    },
}));

const RegisterTrainingPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedAffiliate, setSelectedAffiliate] = useState(null);
    const [plans, setPlans] = useState([]);
    const [isHomeGym, setIsHomeGym] = useState(false);
    const [userPlans, setUserPlans] = useState([]);

console.log("selectedAffiliate", selectedAffiliate);
    const navigate = useNavigate();

    useEffect(() => {
        const getUserHomeGym = async () => {
            try {
                const userHomeAffiliate = await checkHomeAffiliate();
                if (userHomeAffiliate) {
                    setIsHomeGym(true);
                    const affiliateData = await fetchAffiliateInfo(userHomeAffiliate);
                    setSelectedAffiliate(affiliateData.affiliate);
                    loadAffiliatePlans(affiliateData.affiliate.id);
                }
            } catch (error) {
                console.error("❌ Error fetching user home gym:", error);
            }
        };

        getUserHomeGym();
    }, []);

    const handleSearchChange = async (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.trim()) {
            const results = await fetchAffiliates(e.target.value.trim());
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    const handleAffiliateSelect = async (affiliate) => {
        const affiliateData = await fetchAffiliateInfo(affiliate.id);
        const affiliateInfo = affiliateData.affiliate;
        setSelectedAffiliate(affiliateInfo);

        setPlans([]);
        setSuggestions([]);
        setSearchQuery("");
    };

    const loadAffiliatePlans = async () => {
        if (!selectedAffiliate || !selectedAffiliate.id) {
            return;
        }

        try {
            const affiliatePlans = await fetchPlans(selectedAffiliate.ownerId);
            setPlans(affiliatePlans);

           const getUserPlans = await getUserPlansByAffiliate(selectedAffiliate.id);
            setUserPlans(getUserPlans);
        } catch (error) {
            console.error("❌ Error loading plans:", error);
        }
    };

    const handleAddHomeAffiliate = async () => {
        if (!selectedAffiliate || !selectedAffiliate.id) {
            return;
        }

        try {
            await addHomeAffiliate(selectedAffiliate.id);
            setIsHomeGym(true);
        } catch (error) {
            console.error("❌ Error adding home gym:", error);
        }
    };

    const handleRemoveHomeAffiliate = async () => {
        if (selectedAffiliate) {
            await removeHomeAffiliate(selectedAffiliate.id);
            setIsHomeGym(false);
        }
    };

    const handleBuyPlan = (plan) => {
        // NB! Siin edastame affiliateId ja plan-objekti state kaudu
        navigate("/checkout", {
            state: {
                affiliate: selectedAffiliate, // kui vajad tervet affiliate objekti
                 // kui vajad ainult affiliate.id
                plan: plan
            }
        });
    };

    function getValidUntil(planId, userPlans) {
        // Leia kasutaja ostetud plaan vastava planId järgi
        const found = userPlans.find((up) => up.planId === planId);
        if (!found) {
            return null; // kasutajal pole seda plaani ostetud
        }

        // Kas plaan on veel kehtiv (endDate tulevikus)?
        const now = new Date();
        const endDate = new Date(found.endDate);
        if (endDate > now) {
            // Tagastame kehtiva kuupäeva kujul "DD.MM.YYYY"
            return formatDateISOtoDDMMYYYY(found.endDate);
        }
        // Muidu on aegunud
        return null;
    }


    function formatDateISOtoDDMMYYYY(isoDateString) {
        if (!isoDateString) return null;
        const d = new Date(isoDateString);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    }


    return (
        <AppTheme>
            <StyledContainer maxWidth={false}>
                <Typography variant="h4" gutterBottom>
                    Register for Training
                </Typography>

                {/* Search Affiliate */}
                <TextField
                    label="Search Affiliate"
                    fullWidth
                    value={searchQuery}
                    onChange={handleSearchChange}
                    margin="normal"
                />
                <List>
                    {suggestions.map((affiliate) => (
                        <ListItem
                            key={affiliate.id}
                            button
                            onClick={() => handleAffiliateSelect(affiliate)}
                        >
                            <ListItemText primary={affiliate.name} />
                        </ListItem>
                    ))}
                </List>

                {/* Affiliate Info */}
                {selectedAffiliate && (
                    <Box
                        mt={4}
                        sx={{
                            border: "1px solid #ddd",
                            borderRadius: "12px",
                            p: 3,
                            backgroundColor: (theme) => theme.palette.background.paper,
                            boxShadow: (theme) => theme.shadows[1],
                        }}
                    >
                        {/* Pealkiri koos ikooniga */}
                        <Typography
                            variant="h5"
                            sx={{
                                mb: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                fontWeight: "bold",
                            }}
                        >
                            <BusinessIcon color="primary" />
                            Affiliate Information
                        </Typography>

                        {/* Nimi */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <BusinessIcon sx={{ color: "gray" }} />
                            <Typography>
                                <strong>Name:</strong> {selectedAffiliate.name}
                            </Typography>
                        </Box>

                        {/* Aadress */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <LocationOnIcon sx={{ color: "gray" }} />
                            <Typography>
                                <strong>Address:</strong> {selectedAffiliate.address}
                            </Typography>
                        </Box>

                        {/* Treeningu tüüp */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <FitnessCenterIcon sx={{ color: "gray" }} />
                            <Typography>
                                <strong>Training Type:</strong> {selectedAffiliate.trainingType}
                            </Typography>
                        </Box>

                        {/* Treenerid */}
                        <Box sx={{ mt: 2 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    fontWeight: "bold",
                                    mb: 1,
                                }}
                            >
                                <GroupsIcon color="action" />
                                Trainers
                            </Typography>

                            <List>
                                {selectedAffiliate.trainers.map((trainer) => (
                                    <ListItem key={trainer.id} sx={{ py: 0 }}>
                                        <ListItemText
                                            primary={trainer.fullName || trainer.username}
                                            primaryTypographyProps={{ variant: "subtitle1" }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        {/* Nupud */}
                        <Box mt={3} sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={loadAffiliatePlans}
                                sx={{ minWidth: "120px" }}
                            >
                                View Plans
                            </Button>

                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() =>
                                    navigate("/classes", { state: { affiliate: selectedAffiliate } })
                                }
                                sx={{ minWidth: "120px" }}
                            >
                                View Classes
                            </Button>

                            {isHomeGym ? (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleRemoveHomeAffiliate}
                                    sx={{ minWidth: "120px" }}
                                >
                                    Remove Home Gym
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleAddHomeAffiliate}
                                    sx={{ minWidth: "120px" }}
                                >
                                    Add as Home Gym
                                </Button>
                            )}
                        </Box>
                    </Box>
                )}
                {plans.length > 0 && (
                    <Box mt={4} sx={{ width: "100%", textAlign: "center" }}>
                        <Typography variant="h5">Affiliate Plans</Typography>
                        <Grid
                            container
                            spacing={3}
                            sx={{ alignItems: "center", justifyContent: "center", width: "100%" }}
                        >
                            {plans.map((plan) => {
                                const validUntil = getValidUntil(plan.id, userPlans);

                                return (
                                    <Grid item xs={12} sm={6} md={4} key={plan.id}>
                                        <StyledCard>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                                                    {plan.name}
                                                </Typography>
                                                <Typography variant="h3" sx={{ mb: 1 }}>
                                                    €{plan.price.toFixed(2)}
                                                </Typography>
                                                <Divider sx={{ my: 2 }} />
                                                <Typography variant="subtitle2">
                                                    Valid for {plan.validityDays} days
                                                </Typography>

                                                {validUntil && (
                                                    <Typography variant="body1" sx={{ mt: 1, fontWeight: "medium" }}>
                                                        Valid until {validUntil}
                                                    </Typography>
                                                )}
                                            </CardContent>

                                            <CardActions>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    color="primary"
                                                    disabled={Boolean(validUntil)}
                                                    onClick={() => handleBuyPlan(plan, selectedAffiliate)}
                                                >
                                                    {validUntil ? "Already Active" : "Buy Plan"}
                                                </Button>
                                            </CardActions>
                                        </StyledCard>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                )}

            </StyledContainer>
        </AppTheme>
    );
};

export default RegisterTrainingPage;
