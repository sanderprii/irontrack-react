import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useLocation } from "react-router-dom";
import AddressForm from '../components/AddressForm';
import Info from '../components/Info';           // Muudetud Info, mis võtab arvesse krediidi
import InfoMobile from '../components/InfoMobile'; // Kui on eraldi mobiiliversioon
import PaymentForm from '../components/PaymentForm';
import Review from '../components/Review';
import SitemarkIcon from '../components/SitemarkIcon';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown';

import { buyPlan, getUserCredit  } from "../api/planApi";

// Sammude nimed
const steps = ['Payment details', 'Review your order'];

// Funktsioon, mis tagastab sammu sisu ja edastab lisaks krediidi andmed
function getStepContent(step, planData, affiliateInfo, affiliateCredit, appliedCredit, setAppliedCredit) {
    switch (step) {
        case 0:
            return (
                <PaymentForm
                    affiliateCredit={affiliateCredit}
                    appliedCredit={appliedCredit}
                    setAppliedCredit={setAppliedCredit}
                    planPrice={planData.price}
                />
            );
        case 1:
            return (
                <Review
                    planName={planData.name}
                    planPrice={planData.price}
                    appliedCredit={appliedCredit}
                />
            );
        default:
            throw new Error('Unknown step');
    }
}

export default function Checkout(props) {
    const [activeStep, setActiveStep] = useState(0);
    const location = useLocation();
    const plan = location.state?.plan;
    const affiliate = location.state?.affiliate;
    const [affiliateInfo] = useState(affiliate || {});
    const [planData] = useState(plan || {});

    // Uus seisund: kasutaja poolt rakendatav krediit (näiteks 0 kuni availableCredit)
    const [appliedCredit, setAppliedCredit] = useState(0);
    // Näiteks laetakse affiliati krediidi summa API kaudu – siin simuleerime väärtust 100€
    const [affiliateCredit, setAffiliateCredit] = useState(0);

    useEffect(() => {
        getUserCredit(affiliateInfo.id)
            .then((data) => {
                setAffiliateCredit(data.credit);
            })
            .catch((error) => {
                console.error("Error fetching user credit:", error);
            });
    }, [affiliateInfo.id]);

    const handlePlaceOrder = async () => {
        try {
            // Näiteks fetch() või axios() abil andmed edastada
            const response = await buyPlan(planData, affiliateInfo.id, appliedCredit);
            if (!response.ok) {
                throw new Error('Failed to save plan');
            }
            // Eduka tellimuse järel näita "Thank you" vms
            setActiveStep(activeStep + 1);
        } catch (error) {
            console.error(error);
            // kuva error kasutajale
        }
    };

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            handlePlaceOrder();
            setActiveStep(activeStep + 1);
        } else {
            setActiveStep(activeStep + 1);
        }
    };
    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    // Arvutame uue kogusumma, millest lahutatakse rakendatud krediit
    const totalPrice = Math.max(planData.price - appliedCredit, 0);

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <Box sx={{ position: 'fixed', top: '1rem', right: '1rem' }}>
                <ColorModeIconDropdown />
            </Box>

            <Grid
                container
                sx={{
                    height: {
                        xs: '100%',
                        sm: 'calc(100dvh - var(--template-frame-height, 0px))',
                    },
                    mt: {
                        xs: 4,
                        sm: 0,
                    },
                }}
            >
                {/* Vasak paneel (desktopil) */}
                <Grid
                    xs={12}
                    sm={5}
                    lg={4}
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        backgroundColor: 'background.paper',
                        borderRight: { sm: 'none', md: '1px solid' },
                        borderColor: { sm: 'none', md: 'divider' },
                        alignItems: 'start',
                        pt: 16,
                        px: 10,
                        gap: 4,
                    }}
                >
                    <SitemarkIcon />
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            flexGrow: 1,
                            width: '100%',
                            maxWidth: 500,
                        }}
                    >
                        <Info
                            planName={planData.name}
                            planPrice={planData.price}
                            appliedCredit={appliedCredit}
                        />
                    </Box>
                </Grid>

                {/* Parem paneel (peamine sisu) */}
                <Grid
                    xs={12}
                    md={7}
                    lg={8}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: '100%',
                        width: '100%',
                        backgroundColor: { xs: 'transparent', sm: 'background.default' },
                        alignItems: 'start',
                        pt: { xs: 0, sm: 16 },
                        px: { xs: 2, sm: 10 },
                        gap: { xs: 4, md: 8 },
                    }}
                >
                    {/* Ülemine rida (desktop-stepper) */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: { sm: 'space-between', md: 'flex-end' },
                            alignItems: 'center',
                            width: '100%',
                            maxWidth: { sm: '100%', md: 600 },
                        }}
                    >
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                flexGrow: 1,
                            }}
                        >
                            <Stepper activeStep={activeStep} sx={{ width: '100%', height: 40 }}>
                                {steps.map((label) => (
                                    <Step key={label} sx={{ ':first-child': { pl: 0 }, ':last-child': { pr: 0 } }}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Box>
                    </Box>

                    {/* Mobiilne kaart, mis näitab hinda ja InfoMobile komponendi */}
                    <Card sx={{ display: { xs: 'flex', md: 'none' }, width: '100%' }}>
                        <CardContent
                            sx={{
                                display: 'flex',
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div>
                                <Typography variant="subtitle2" gutterBottom>
                                    Selected products
                                </Typography>
                                <Typography variant="body1">
                                    {totalPrice}€
                                </Typography>
                            </div>
                            <InfoMobile totalPrice={`${totalPrice}€`} />
                        </CardContent>
                    </Card>

                    {/* Peamine sisu (stepper, vormid, nupud) */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            flexGrow: 1,
                            width: '100%',
                            maxWidth: { sm: '100%', md: 600 },
                            maxHeight: '720px',
                            gap: { xs: 5, md: 'none' },
                        }}
                    >
                        <Stepper activeStep={activeStep} alternativeLabel sx={{ display: { sm: 'flex', md: 'none' } }}>
                            {steps.map((label) => (
                                <Step
                                    key={label}
                                    sx={{
                                        ':first-child': { pl: 0 },
                                        ':last-child': { pr: 0 },
                                        '& .MuiStepConnector-root': { top: { xs: 6, sm: 12 } },
                                    }}
                                >
                                    <StepLabel sx={{ '.MuiStepLabel-labelContainer': { maxWidth: '70px' } }}>
                                        {label}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {activeStep === steps.length ? (
                            <Stack spacing={2}>
                                <Typography variant="h1">📦</Typography>
                                <Typography variant="h5">Thank you for your order!</Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                    Your order number is <strong>#140396</strong>. We have emailed your order confirmation and your plan is active.
                                </Typography>
                                <Button variant="contained" sx={{ alignSelf: 'start', width: { xs: '100%', sm: 'auto' } }}>
                                    Go to my orders
                                </Button>
                            </Stack>
                        ) : (
                            <React.Fragment>
                                {getStepContent(activeStep, planData, affiliateInfo, affiliateCredit, appliedCredit, setAppliedCredit)}
                                {/* Navigeerimisnupud */}
                                <Box
                                    sx={[
                                        {
                                            display: 'flex',
                                            flexDirection: { xs: 'column-reverse', sm: 'row' },
                                            alignItems: 'end',
                                            flexGrow: 1,
                                            gap: 1,
                                            pb: { xs: 12, sm: 0 },
                                            mt: { xs: 2, sm: 0 },
                                            mb: '60px',
                                        },
                                        activeStep !== 0
                                            ? { justifyContent: 'space-between' }
                                            : { justifyContent: 'flex-end' },
                                    ]}
                                >
                                    {activeStep !== 0 && (
                                        <Button
                                            startIcon={<ChevronLeftRoundedIcon />}
                                            onClick={handleBack}
                                            variant="text"
                                            sx={{ display: { xs: 'none', sm: 'flex' } }}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {activeStep !== 0 && (
                                        <Button
                                            startIcon={<ChevronLeftRoundedIcon />}
                                            onClick={handleBack}
                                            variant="outlined"
                                            fullWidth
                                            sx={{ display: { xs: 'flex', sm: 'none' } }}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    <Button
                                        variant="contained"
                                        endIcon={<ChevronRightRoundedIcon />}
                                        onClick={handleNext}
                                        sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                                    >
                                        {activeStep === steps.length - 1 ? 'Place order' : 'Next'}
                                    </Button>
                                </Box>
                            </React.Fragment>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </AppTheme>
    );
}
