import * as React from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

function Info({ planName, planPrice, appliedCredit }) {
    // Arvuta uus kogusumma
    const total = Math.max(planPrice - appliedCredit, 0);

    return (
        <React.Fragment>
            {appliedCredit > 0 && (
                <Typography variant="subtitle2" sx={{ color: 'primary.main' }}>
                    Paid by credit: -{appliedCredit}€
                </Typography>
            )}
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Total
            </Typography>
            <Typography variant="h4" gutterBottom>
                {total}€
            </Typography>
            <List disablePadding>
                <ListItem key={planName} sx={{ py: 1, px: 0 }}>
                    <ListItemText primary={planName} sx={{ mr: 2 }} />
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {planPrice}€
                    </Typography>
                </ListItem>
            </List>
        </React.Fragment>
    );
}

Info.propTypes = {
    planName: PropTypes.string.isRequired,
    planPrice: PropTypes.number.isRequired,
    appliedCredit: PropTypes.number,
};

Info.defaultProps = {
    appliedCredit: 0,
};

export default Info;
