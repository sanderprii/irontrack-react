import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles"; // 🆕 Importi teema hook
import { Container, Grid, Typography, Button, Box, Card, CardContent, CardActions, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import PlanFormModal from "../components/PlanFormModal";
import { getPlans, createPlan, updatePlan, deletePlan } from "../api/planApi";
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

    backgroundColor: theme.palette.background.default, // 🆕 Kasuta taustavärvina `background.default`
}));

const StyledCard = styled(Card)(({ theme, AppTheme }) => ({
    padding: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    textAlign: "center",
    transition: "0.3s",
    backgroundColor: theme.palette.background.paper, // 🆕 Kasuta taustavärvina `background.paper`
    "&:hover": {
        boxShadow: theme.shadows[5],
    },
}));

export default function Plans() {
    const theme = useTheme(); // 🆕 Võta teema
    const [plans, setPlans] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    useEffect(() => {
        console.log("Theme changed:", theme.palette.mode); // 🆕 Kontrolli, kas teema muutus
    }, [theme]);

    const fetchPlans = async () => {
        const data = await getPlans();
        setPlans(data);
    };

    const handleSave = async (planData) => {
        if (!planData) {
            await deletePlan(selectedPlan.id);
        } else if (selectedPlan) {
            await updatePlan(selectedPlan.id, planData);
        } else {
            await createPlan(planData);
        }

        setModalOpen(false);
        setSelectedPlan(null);
        fetchPlans();
    };

    return (
        <AppTheme>
            <StyledContainer maxWidth={false}>
                <Typography component="h2" variant="h4" sx={{ textAlign: "center", color: "text.primary" }}>
                    Plans
                </Typography>
                <Typography variant="body1" sx={{ textAlign: "center", color: "text.secondary" }}>
                    Choose a plan that best suits your needs. Upgrade anytime.
                </Typography>

                <Button variant="contained" color="primary" onClick={() => setModalOpen(true)}>
                    Add Plan
                </Button>

                <Grid container spacing={3} sx={{ alignItems: "center", justifyContent: "center", width: "100%" }}>
                    {plans.map((plan) => (
                        <Grid item xs={12} sm={plan.name === "Enterprise" ? 12 : 6} md={4} key={plan.id}>
                            <StyledCard
                                onClick={() => {
                                    setSelectedPlan(plan);
                                    setModalOpen(true);
                                }}
                                sx={plan.name === "Professional"
                                    ? {
                                        border: "none",

                                        boxShadow: "0 8px 12px hsla(220, 20%, 42%, 0.2)",
                                        bgcolor: "background.paper", // 🆕 Kasuta dünaamilist taustavärvi
                                        p: 3,
                                        borderLeft: "5px solid #FFB347",
                                    }
                                    : {}}
                            >
                                <CardContent>
                                    <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                                        <Typography component="h3" variant="h6">
                                            {plan.name}
                                        </Typography>
                                        {plan.name === "Professional" && <AutoAwesomeIcon />}
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "center" }}>
                                        <Typography component="h3" variant="h2">
                                            €{plan.price.toFixed(2)}
                                        </Typography>
                                        <Typography component="h3" variant="h6">&nbsp; per month</Typography>
                                    </Box>
                                    <Divider sx={{ my: 2, opacity: 0.8, borderColor: "divider" }} />
                                    <Box sx={{ py: 1, display: "flex", gap: 1.5, alignItems: "center", flexDirection: "column" }}>
                                        <CheckCircleRoundedIcon color="primary" />
                                        <Typography variant="subtitle2">{plan.validityDays} days of access</Typography>
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button fullWidth variant="contained" color="primary">
                                        Edit Plan
                                    </Button>
                                </CardActions>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>

                <PlanFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} plan={selectedPlan} />
            </StyledContainer>
        </AppTheme>
    );
}
