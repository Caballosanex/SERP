import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Box, 
  Container, 
  Paper, 
  Typography
} from '@mui/material';

const AuthLayout = () => {
  const { mode } = useTheme();
  
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
            <Box
              component="img"
              src="/resources/SERP_ico_N.png"
              alt="SERP Logo"
              sx={{
                width: 200,
                height: 'auto',
                mb: 2,
                objectFit: 'contain'
              }}
            />
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              S.E.R.P
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