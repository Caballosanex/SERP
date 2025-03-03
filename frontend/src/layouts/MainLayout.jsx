import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Avatar, 
  Menu, 
  MenuItem, 
  Badge, 
  Tooltip 
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { toggleSidebar } from '../redux/slices/uiSlice';

const drawerWidth = 240;

const MainLayout = () => {
  const dispatch = useDispatch();
  const { mode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const sidebarOpen = useSelector(state => state.ui.sidebarOpen);
  const notifications = useSelector(state => state.ui.notifications);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };
  
  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };
  
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  // Menú lateral según el rol del usuario
  const getSidebarItems = () => {
    const commonItems = [
      {
        text: 'Tauler Principal',
        icon: <DashboardIcon />,
        path: '/dashboard'
      }
    ];
    
    if (user?.role === 'emergency_center') {
      return [
        ...commonItems,
        {
          text: 'Gestió de Recursos',
          icon: <PeopleIcon />,
          path: '/resources'
        },
        {
          text: 'Configuració',
          icon: <SettingsIcon />,
          path: '/settings'
        }
      ];
    } else if (user?.role === 'resource_personnel') {
      return [
        ...commonItems,
        {
          text: 'El Meu Dispositiu',
          icon: <LocationIcon />,
          path: '/my-device'
        }
      ];
    } else if (user?.role === 'emergency_operator') {
      return [
        ...commonItems,
        {
          text: 'Crear Emergència',
          icon: <LocationIcon />,
          path: '/create-emergency'
        },
        {
          text: 'Assignar Recursos',
          icon: <PeopleIcon />,
          path: '/assign-resources'
        }
      ];
    }
    
    return commonItems;
  };
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleToggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            SERP - Sistema d'Emergències i Resposta Prioritaria
          </Typography>
          
          {/* Botón de Notificaciones */}
          <Tooltip title="Notificacions">
            <IconButton color="inherit" onClick={handleNotificationsOpen}>
              <Badge badgeContent={unreadNotifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Botón de cambio de tema */}
          <Tooltip title={mode === 'dark' ? 'Mode clar' : 'Mode fosc'}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          
          {/* Menú de usuario */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Tooltip title="Configuració del compte">
              <IconButton onClick={handleMenuOpen} color="inherit">
                <Avatar 
                  alt={user?.name || 'Usuari'} 
                  src="/static/images/avatar/1.jpg" 
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">{user?.name}</Typography>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>El meu perfil</MenuItem>
              <MenuItem onClick={handleMenuClose}>Configuració</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                Tancar sessió
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Menú de notificaciones */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        sx={{ mt: '45px' }}
      >
        {notifications.length === 0 ? (
          <MenuItem disabled>No hi ha notificacions</MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={handleNotificationsClose}
              sx={{ 
                backgroundColor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                maxWidth: 300
              }}
            >
              <Typography variant="body2" noWrap>
                {notification.message}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>
      
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            position: 'fixed',
            transform: sidebarOpen ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
            transition: (theme) => theme.transitions.create('transform', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open={sidebarOpen}
      >
        <Toolbar /> {/* Espacio para el AppBar */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {getSidebarItems().map((item) => (
              <ListItem button key={item.text}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      {/* Contenido principal */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3, 
        width: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)`,
        ml: sidebarOpen ? `${drawerWidth}px` : 0,
        transition: (theme) => theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}>
        <Toolbar /> {/* Espacio para el AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 