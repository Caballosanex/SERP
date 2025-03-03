import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  IconButton, 
  AppBar, 
  Toolbar 
} from '@mui/material';
import { 
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon 
} from '@mui/icons-material';

const AuthLayout = () => {
  const { mode, toggleTheme } = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        backgroundColor: (theme) => 
          theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary.light
      }}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SERP - Sistema d'Emergències i Resposta Prioritaria
          </Typography>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container 
        maxWidth="sm" 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flexGrow: 1,
          py: 4 
        }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            width: '100%', 
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <Box 
            sx={{ 
              mb: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}
          >
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              SERP
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary">
              Sistema d'Emergències i Resposta Prioritaria
            </Typography>
          </Box>
          
          <Outlet />
        </Paper>
        
        <Typography 
          variant="body2" 
          color="textSecondary" 
          align="center" 
          sx={{ mt: 4 }}
        >
          © {new Date().getFullYear()} SERP. Tots els drets reservats.
        </Typography>
      </Container>
    </Box>
  );
};

export default AuthLayout; 