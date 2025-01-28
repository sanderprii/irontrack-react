import * as React from 'react';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

export default function Review({ totalPrice, planName, planPrice, appliedCredit }) {
  // Arvuta uus kogusumma
  const total = Math.max(planPrice - appliedCredit, 0);

  return (
      <Stack spacing={2}>
        <List disablePadding>
          <ListItem sx={{ py: 1, px: 0 }}>
            <ListItemText primary="Products" secondary="4 selected" />
            <Typography variant="body2">{planPrice}€</Typography>
          </ListItem>
          {appliedCredit > 0 && (
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Paid by credit" />
                <Typography variant="body2" color="text.primary">
                  -{appliedCredit}€
                </Typography>
              </ListItem>
          )}
          <ListItem sx={{ py: 1, px: 0 }}>
            <ListItemText primary="Total" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {total}€
            </Typography>
          </ListItem>
        </List>
        <Divider />
        <Stack direction="column" divider={<Divider flexItem />} spacing={2} sx={{ my: 2 }}>
          <div>
            <Typography variant="subtitle2" gutterBottom>
              Payment details
            </Typography>
            <Grid container>
              {/* Näiteks võib siia lisada makse detailide ridu */}
              <Grid item xs={12}>
                <Typography variant="body2">
                  Payment method: {appliedCredit > 0 ? 'Credit' : 'Other'}
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Stack>
      </Stack>
  );
}

Review.propTypes = {
  planName: PropTypes.string.isRequired,
  planPrice: PropTypes.number.isRequired,
  totalPrice: PropTypes.number, // mitte enam kasutusel, kuna arvutame uuesti
  appliedCredit: PropTypes.number,
};

Review.defaultProps = {
  appliedCredit: 0,
};
