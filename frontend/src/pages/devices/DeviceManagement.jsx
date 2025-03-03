import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import DeviceList from '../../components/DeviceList';

const DeviceManagement = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Dispositivos Nokia NAC
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Administra y monitoriza tus dispositivos móviles, obtén su ubicación y estado, y establece sesiones de Quality of Service on Demand (QoD).
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 0, overflow: 'hidden' }}>
        <DeviceList />
      </Paper>
    </Container>
  );
};

export default DeviceManagement; 