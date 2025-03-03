import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper 
} from '@mui/material';
import { 
  SentimentDissatisfied as SadIcon 
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Determinar la ruta de inicio según el rol del usuario autenticado
  const getHomeRoute = () => {
    if (!isAuthenticated) return '/login';
    
    if (user?.role === 'emergency_center') {
      return '/dashboard';
    } else if (user?.role === 'resource_personnel') {
      return '/resource';
    } else if (user?.role === 'emergency_operator') {
      return '/operator';
    }
    
    return '/login';
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.background.default
      }}
    >
      <Container maxWidth="md">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <SadIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
          
          <Typography variant="h2" gutterBottom>
            404
          </Typography>
          
          <Typography variant="h4" gutterBottom>
            Pàgina no trobada
          </Typography>
          
          <Typography variant="body1" color="textSecondary" paragraph>
            La pàgina que estàs buscant no existeix o ha estat moguda.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to={getHomeRoute()}
            sx={{ mt: 2 }}
          >
            Tornar a l'inici
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound; 