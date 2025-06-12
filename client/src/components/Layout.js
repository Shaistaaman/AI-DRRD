import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MapIcon from '@mui/icons-material/Map';
import ScienceIcon from '@mui/icons-material/Science';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Portfolio Analysis', icon: <AccountBalanceIcon />, path: '/portfolio' },
  { text: 'Upload Portfolio', icon: <CloudUploadIcon />, path: '/portfolio-upload' },
  { text: 'Risk Map', icon: <MapIcon />, path: '/risk-map' },
  { text: 'Weather Risk', icon: <ThunderstormIcon />, path: '/weather-risk' },
  { text: 'Scenario Builder', icon: <ScienceIcon />, path: '/scenario-builder' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' }
];

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('/');
  const navigate = useNavigate();
  const location = useLocation();

  // Update active menu item when location changes
  useEffect(() => {
    setActiveMenuItem(location.pathname);
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Box
            component="img"
            src="/images/logo.png"
            sx={{ width: 150, height: 150, mb: 1 }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <Typography variant="h6" noWrap component="div">
            AIDRRD
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={activeMenuItem === item.path}
              onClick={() => {
                navigate(item.path);
                setActiveMenuItem(item.path);
                if (mobileOpen) handleDrawerToggle();
              }}
              component={motion.div}
              whileHover={{
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                x: 4
              }}
              transition={{ duration: 0.2 }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.25)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 'bold',
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          backgroundColor: 'background.paper',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === activeMenuItem)?.text || 'Dashboard'}
          </Typography>

          <Box sx={{ display: 'flex' }}>
            <Tooltip title="Help">
              <IconButton
                color="inherit"
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <NotificationsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Account">
              <IconButton
                onClick={handleMenuOpen}
                color="inherit"
                component={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default'
        }}
      >
        <Toolbar />
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;