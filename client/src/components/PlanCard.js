import React from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";

export default function PlanCard({ plan, onEdit }) {
    return (
        <Card sx={{ width: 250, margin: 2, textAlign: "center", cursor: "pointer", bgcolor: "background.paper", p: 3,
            borderLeft: "5px solid #FFB347" }} onClick={() => onEdit(plan)}>
            <CardContent>
                <Typography variant="h5">{plan.name}</Typography>
                <Typography variant="h6">{plan.price.toFixed(2)}€</Typography>
                <Typography variant="body2">{plan.validityDays} days</Typography>
            </CardContent>
        </Card>
    );
}
