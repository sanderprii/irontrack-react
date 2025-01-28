import * as React from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { styled, alpha } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Sitemark from './SitemarkIcon';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
      ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
      : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: '8px 12px',
}));

export default function AppAppBar() {
  const { isLoggedIn, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  // --------------------------------
  // Lisa dünaamilised nupud navbarile
  // --------------------------------
  let leftLinks = [];
  let rightLinks = [];

  if (!isLoggedIn) {
    leftLinks = [{ name: 'Home', to: '/' }, { name: 'About', to: '/about' }];
    rightLinks = [{ name: 'Log In', to: '/login' }, { name: 'Join Us', to: '/register' }];
  } else {
    if (role === 'regular') {
      leftLinks = [
        { name: 'Trainings', to: '/trainings' },
        { name: 'Records', to: '/records' },
        { name: 'Find Users', to: '/find-users' },
        { name: 'Register for Training', to: '/register-training' },
      ];
      rightLinks = [{ name: 'My Profile', to: '/my-profile' }, { name: 'Log Out', action: logout }];
    } else if (role === 'affiliate') {
      leftLinks = [
        { name: 'My Affiliate', to: '/my-affiliate' },
        { name: 'Classes', to: '/classes' },
        { name: 'Members', to: '/members' },
        { name: 'Plans', to: '/plans' },
      ];
      rightLinks = [{ name: 'Log Out', action: logout }];
    } else if (role === 'trainer') {
      leftLinks = [{ name: 'Trainer Page', to: '/trainer' }];
      rightLinks = [{ name: 'Log Out', action: logout }];
    } else if (role === 'checkin') {
      leftLinks = [{ name: 'Check-In Page', to: '/check-in' }];
      rightLinks = [{ name: 'Log Out', action: logout }];
    }
  }

  return (
      <AppBar position="static" enableColorOnDark sx={{ boxShadow: 0, bgcolor: 'transparent' }}>
        <Container maxWidth="lg">
          <StyledToolbar variant="dense" disableGutters>
            {/* Logo */}
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
              <Sitemark />
            </Box>

            {/* Desktop menüü (left links) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              {leftLinks.map((link) =>
                  link.action ? (
                      <Button key={link.name} onClick={link.action} variant="text" color="info" size="small">
                        {link.name}
                      </Button>
                  ) : (
                      <Button key={link.name} component={Link} to={link.to} variant="text" color="info" size="small">
                        {link.name}
                      </Button>
                  )
              )}
            </Box>

            {/* Desktop menüü (right links) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {rightLinks.map((link) =>
                  link.action ? (
                      <Button key={link.name} onClick={link.action} color="primary" variant="text" size="small">
                        {link.name}
                      </Button>
                  ) : (
                      <Button key={link.name} component={Link} to={link.to} color="primary" variant="contained" size="small">
                        {link.name}
                      </Button>
                  )
              )}
            </Box>

            {/* Mobile menu button */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
              <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="top" open={open} onClose={toggleDrawer(false)}>
                <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton onClick={toggleDrawer(false)}>
                      <CloseRoundedIcon />
                    </IconButton>
                  </Box>

                  {leftLinks.map((link) => (
                      <MenuItem key={link.name} onClick={toggleDrawer(false)}>
                        <Button component={Link} to={link.to} color="inherit" fullWidth>
                          {link.name}
                        </Button>
                      </MenuItem>
                  ))}
                  {rightLinks.map((link) => (
                      <MenuItem key={link.name} onClick={toggleDrawer(false)}>
                        <Button
                            onClick={link.action ? link.action : undefined}
                            component={link.to ? Link : undefined}
                            to={link.to ? link.to : undefined}
                            color="inherit"
                            fullWidth
                        >
                          {link.name}
                        </Button>
                      </MenuItem>
                  ))}
                </Box>
              </Drawer>
            </Box>
          </StyledToolbar>
        </Container>
      </AppBar>
  );
}
