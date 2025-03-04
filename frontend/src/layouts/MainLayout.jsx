import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  ExitToApp as ExitToAppIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  LocalShipping as ResourcesIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
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
  
  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  // Menú lateral según el rol del usuario
  const getSidebarItems = () => {
    // Elementos básicos que todos los roles pueden ver
    const basicItems = [
      {
        text: 'Tauler Principal',
        icon: <DashboardIcon />,
        path: '/dashboard'
      },
      {
        text: 'Nova Emergència',
        icon: <AddIcon />,
        path: '/emergencies/nova'
      },
      {
        text: 'Editor d\'Incidents',
        icon: <EditIcon />,
        path: '/emergencies/editor'
      },
      {
        text: 'Seguiment',
        icon: <AssignmentIcon />,
        path: '/emergencies/seguiment'
      },
      {
        text: 'Recursos',
        icon: <ResourcesIcon />,
        path: '/devices/resources'
      }
    ];

    // Elementos adicionales según el rol
    const adminItems = [
      {
        text: 'Gestió Usuaris',
        icon: <PeopleIcon />,
        path: '/usuaris'
      }
    ];

    const resourceItems = [
      {
        text: 'El Meu Dispositiu',
        icon: <LocationIcon />,
        path: '/my-device'
      }
    ];
    
    // Determinar qué elementos mostrar según el rol
    if (user?.role === 'emergency_center') {
      return [...basicItems, ...adminItems];
    } else if (user?.role === 'resource_personnel') {
      return [...basicItems, ...resourceItems];
    } else if (user?.role === 'emergency_operator') {
      return basicItems;
    }
    
    // Por defecto, mostrar solo elementos básicos
    return basicItems;
  };
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/resources/SERP_ico.png" 
              alt="SERP Logo" 
              style={{ 
                height: '32px', 
                marginRight: '12px' 
              }} 
            />
            <Typography variant="h6" noWrap component="div">
              SERP - Sistema d'Emergències i Resposta Prioritaria
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
            </Box>
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
            position: 'fixed'
          },
        }}
      >
        <Toolbar /> {/* Espacio para el AppBar */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {getSidebarItems().map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => navigate(item.path)}
              >
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
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: '0px !important',
        transition: 'none !important'
      }}>
        <Toolbar /> {/* Espacio para el AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 