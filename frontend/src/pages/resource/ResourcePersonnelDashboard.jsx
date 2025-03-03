import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  CircularProgress, 
  Divider, 
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  DirectionsCar as VehicleIcon,
  Speed as SpeedIcon,
  Battery90 as BatteryIcon,
  SignalCellular4Bar as SignalIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { fetchResources } from '../../redux/slices/resourcesSlice';
import { fetchEmergencies } from '../../redux/slices/emergenciesSlice';
import { useAuth } from '../../context/AuthContext';

const ResourcePersonnelDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [loadingResource, setLoadingResource] = useState(true);
  
  // Obtener los recursos y emergencias del estado
  const resources = useSelector(state => state.resources.resources);
  const resourcesStatus = useSelector(state => state.resources.status);
  const emergencies = useSelector(state => state.emergencies.emergencies);
  const emergenciesStatus = useSelector(state => state.emergencies.status);
  
  // Estado para simular la calidad de señal
  const [qosStatus, setQosStatus] = useState({
    signal: 'good', // 'good', 'medium', 'poor'
    battery: 85,
    lastUpdated: new Date().toISOString()
  });
  
  // Simular que cambia la calidad de la señal periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const signals = ['good', 'medium', 'poor'];
      const randomSignal = signals[Math.floor(Math.random() * signals.length)];
      const randomBattery = Math.max(qosStatus.battery - Math.floor(Math.random() * 2), 0);
      
      setQosStatus({
        signal: randomSignal,
        battery: randomBattery,
        lastUpdated: new Date().toISOString()
      });
    }, 30000); // Cada 30 segundos
    
    return () => clearInterval(interval);
  }, [qosStatus]);
  
  // Encontrar el recurso asignado a este usuario
  const myResource = resources.find(r => r.userId === user?.id);
  
  // Encontrar la emergencia asignada a este recurso
  const myEmergency = myResource?.emergencyId 
    ? emergencies.find(e => e.id === myResource.emergencyId)
    : null;
  
  useEffect(() => {
    // Cargar recursos y emergencias
    dispatch(fetchResources());
    dispatch(fetchEmergencies());
    
    // Simular tiempo de carga para el recurso
    const timer = setTimeout(() => {
      setLoadingResource(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [dispatch]);
  
  const handleRefresh = () => {
    setLoadingResource(true);
    dispatch(fetchResources());
    dispatch(fetchEmergencies());
    
    // Simular tiempo de carga
    setTimeout(() => {
      setLoadingResource(false);
    }, 1500);
  };
  
  const isLoading = 
    loadingResource || 
    resourcesStatus === 'loading' || 
    emergenciesStatus === 'loading';
    
  // Rendel signal icon based on status
  const renderSignalIcon = () => {
    const color = qosStatus.signal === 'good' 
      ? 'success' 
      : qosStatus.signal === 'medium' 
        ? 'warning' 
        : 'error';
        
    return <SignalIcon color={color} />;
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tauler de Personal de Recursos
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          variant="outlined" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Actualitzar
        </Button>
      </Box>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Estado del dispositivo */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Estat del Dispositiu
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VehicleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1">
                    {myResource?.type || 'Vehicle no identificat'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {myResource?.id || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    {renderSignalIcon()}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Qualitat del Senyal" 
                    secondary={
                      qosStatus.signal === 'good' 
                        ? 'Excel·lent' 
                        : qosStatus.signal === 'medium' 
                          ? 'Mitjana' 
                          : 'Pobra'
                    } 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <BatteryIcon color={qosStatus.battery > 20 ? 'success' : 'error'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Bateria" 
                    secondary={`${qosStatus.battery}%`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SpeedIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Última Actualització" 
                    secondary={new Date(qosStatus.lastUpdated).toLocaleTimeString()} 
                  />
                </ListItem>
              </List>
              
              {qosStatus.signal === 'poor' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <AlertTitle>Avís</AlertTitle>
                  Qualitat de senyal baixa. Pot afectar la comunicació.
                </Alert>
              )}
              
              {qosStatus.battery <= 20 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <AlertTitle>Bateria baixa</AlertTitle>
                  Cal connectar a una font d'alimentació aviat.
                </Alert>
              )}
            </Paper>
          </Grid>
          
          {/* Emergencia asignada */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Emergència Assignada
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {myEmergency ? (
                <>
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h5" gutterBottom>
                          {myEmergency.title}
                        </Typography>
                        <Chip 
                          label={myEmergency.status === 'active' ? 'Activa' : myEmergency.status === 'pending' ? 'Pendent' : 'Resolta'} 
                          color={myEmergency.status === 'active' ? 'error' : myEmergency.status === 'pending' ? 'warning' : 'success'} 
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          {myEmergency.location}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PhoneIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {myEmergency.contactPhone || '112'}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" color="textSecondary" paragraph>
                        {myEmergency.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button variant="contained" color="primary" startIcon={<CheckCircleIcon />}>
                          Confirmar Arribada
                        </Button>
                        <Button variant="outlined" color="warning" startIcon={<WarningIcon />}>
                          Reportar Problema
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  {/* Mapa con la ubicación de la emergencia */}
                  <Box sx={{ height: 300 }}>
                    <MapContainer 
                      center={[myEmergency.latitude, myEmergency.longitude]} 
                      zoom={15} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[myEmergency.latitude, myEmergency.longitude]}>
                        <Popup>
                          <Typography variant="subtitle1">{myEmergency.title}</Typography>
                          <Typography variant="body2">{myEmergency.location}</Typography>
                        </Popup>
                      </Marker>
                      <Circle 
                        center={[myEmergency.latitude, myEmergency.longitude]}
                        radius={500}
                        pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }}
                      />
                    </MapContainer>
                  </Box>
                </>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <WarningIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Cap emergència assignada
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Actualment no tens cap emergència assignada al teu recurs.
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 2 }} onClick={handleRefresh}>
                    Comprovar de nou
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ResourcePersonnelDashboard; 