import * as React from 'react';
import {useState, useEffect} from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import MuiCard from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {styled} from '@mui/material/styles';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
// Muudame esimese variandi väärtuse "credit" nimele, et vastata krediidi funktsionaalsusele
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

const Card = styled(MuiCard)(({theme, selected}) => ({
    border: '1px solid',
    borderColor: (theme.vars || theme).palette.divider,
    width: '100%',
    '&:hover': {
        background:
            'linear-gradient(to bottom right, hsla(210, 100%, 97%, 0.5) 25%, hsla(210, 100%, 90%, 0.3) 100%)',
        borderColor: 'primary.light',
        boxShadow: '0px 2px 8px hsla(0, 0%, 0%, 0.1)',
    },
    ...(selected && {
        borderColor: (theme.vars || theme).palette.primary.light,
    }),
}));

const PaymentContainer = styled('div')(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    border: '1px solid',
    borderColor: (theme.vars || theme).palette.divider,
    background:
        'linear-gradient(to bottom right, hsla(220, 35%, 97%, 0.3) 25%, hsla(220, 20%, 88%, 0.3) 100%)',
}));

const FormGrid = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

export default function PaymentForm({planPrice, affiliateCredit, appliedCredit, setAppliedCredit}) {
    const [paymentType, setPaymentType] = useState('credit'); // vaikimisi "credit"
    const [useCredit, setUseCredit] = useState(false);
    const [creditInput, setCreditInput] = useState(affiliateCredit);

    // Kui affiliati krediidiväärtus muutub, uuendame eeltäite
    useEffect(() => {
        setCreditInput(planPrice);
    }, [planPrice]);

    const handlePaymentTypeChange = (event) => {
        setPaymentType(event.target.value);
    };

    const handleCheckboxChange = (event) => {
        setUseCredit(event.target.checked);
        if (!event.target.checked) {
            // Kui checkbox eemaldatakse, tühistame rakendatud krediidi
            setAppliedCredit(0);
        }
    };

    const handleCreditInputChange = (event) => {
        const value = event.target.value;
        // Võid lisada täiendavat valideerimist (näiteks lubada ainult numbreid)
        setCreditInput(value);
    };

    const handleApplyCredit = () => {
        const value = Number(creditInput);
        // Kontrolli, et sisestatud summa ei ületaks saadaolevat krediiti
        if (value > planPrice) {
            alert('You cannot apply more than the plan price.');
            return;
        }

        if (value > affiliateCredit) {
            alert('You cannot apply more than your available credit.');
            return;
        }
        // Rakenda krediit – edastame väärtuse ülemisele komponendile
        setAppliedCredit(value);
    };

    return (
        <Stack spacing={{xs: 3, sm: 6}}>
            <FormControl component="fieldset" fullWidth>
                <RadioGroup
                    aria-label="Payment options"
                    name="paymentType"
                    value={paymentType}
                    onChange={handlePaymentTypeChange}
                    sx={{
                        display: 'flex',
                        flexDirection: {xs: 'column', sm: 'row'},
                        gap: 2,
                    }}
                >
                    <Card selected={paymentType === 'credit'}>
                        <CardActionArea onClick={() => setPaymentType('credit')}>
                            <CardContent sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <CreditCardRoundedIcon
                                    fontSize="small"
                                    sx={{
                                        color: paymentType === 'credit' ? 'primary.main' : 'grey.400',
                                    }}
                                />
                                <Typography sx={{fontWeight: 'medium'}}>Credit</Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                    <Card selected={paymentType === 'bankTransfer'}>
                        <CardActionArea onClick={() => setPaymentType('bankTransfer')}>
                            <CardContent sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <AccountBalanceRoundedIcon
                                    fontSize="small"
                                    sx={{
                                        color: paymentType === 'bankTransfer' ? 'primary.main' : 'grey.400',
                                    }}
                                />
                                <Typography sx={{fontWeight: 'medium'}}>Bank account</Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </RadioGroup>
            </FormControl>

            {paymentType === 'credit' && (
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                    <PaymentContainer>
                        <Box sx={{mb: 2}}>
                            <Typography variant="subtitle2">
                                Available Credit: {affiliateCredit}€
                            </Typography>
                        </Box>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={useCredit}
                                    onChange={handleCheckboxChange}
                                    name="useCredit"
                                />
                            }
                            label="Use credit on purchase"
                        />

                        {useCredit && (
                            <Box sx={{mt: 2, display: 'flex', flexDirection: 'column', gap: 1}}>
                                <TextField
                                    label="Credit Amount"
                                    type="number"
                                    value={creditInput}
                                    onChange={handleCreditInputChange}
                                    InputProps={{inputProps: {min: 0, max: planPrice}}}
                                />
                                <Button variant="contained" onClick={handleApplyCredit}>
                                    Apply
                                </Button>
                            </Box>
                        )}
                    </PaymentContainer>
                </Box>
            )}

            {paymentType === 'bankTransfer' && (
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                    <Alert severity="warning" icon={<WarningRoundedIcon/>}>
                        Your order will be processed once we receive the funds.
                    </Alert>
                    <Typography variant="subtitle1" sx={{fontWeight: 'medium'}}>
                        Bank account
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Please transfer the payment to the bank account details shown below.
                    </Typography>
                    <Box sx={{display: 'flex', gap: 1}}>
                        <Typography variant="body1" sx={{color: 'text.secondary'}}>
                            Bank:
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 'medium'}}>
                            Mastercredit
                        </Typography>
                    </Box>
                    <Box sx={{display: 'flex', gap: 1}}>
                        <Typography variant="body1" sx={{color: 'text.secondary'}}>
                            Account number:
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 'medium'}}>
                            123456789
                        </Typography>
                    </Box>
                    <Box sx={{display: 'flex', gap: 1}}>
                        <Typography variant="body1" sx={{color: 'text.secondary'}}>
                            Routing number:
                        </Typography>
                        <Typography variant="body1" sx={{fontWeight: 'medium'}}>
                            987654321
                        </Typography>
                    </Box>
                </Box>
            )}
        </Stack>
    );
}
