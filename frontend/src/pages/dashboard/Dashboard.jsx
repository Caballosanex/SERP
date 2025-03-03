import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Button, 
  Chip, 
  Divider,
  Card, 
  CardContent, 
  CardHeader,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Map as MapIcon,
  List as ListIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchEmergencies } from '../../redux/slices/emergenciesSlice';
import { fetchResources } from '../../redux/slices/resourcesSlice';
import { fetchAlerts } from '../../redux/slices/alertsSlice';
import { setCurrentView } from '../../redux/slices/uiSlice';

// Panel de estadísticas
const StatPanel = ({ title, value, color }) => (
  <Card elevation={2} sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h3" color={color} align="center">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

// Componente de dashboard
const Dashboard = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const emergencies = useSelector(state => state.emergencies.emergencies);
  const emergenciesStatus = useSelector(state => state.emergencies.status);
  const resources = useSelector(state => state.resources.resources);
  const resourcesStatus = useSelector(state => state.resources.status);
  const alerts = useSelector(state => state.alerts.alerts);
  const alertsStatus = useSelector(state => state.alerts.status);
  const currentView = useSelector(state => state.ui.currentView);
  
  // Filtrar emergencias por búsqueda
  const filteredEmergencies = emergencies.filter(emergency => 
    emergency.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emergency.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emergency.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Estadísticas
  const activeEmergencies = emergencies.filter(e => e.status === 'active').length;
  const pendingEmergencies = emergencies.filter(e => e.status === 'pending').length;
  const resolvedEmergencies = emergencies.filter(e => e.status === 'resolved').length;
  const totalResources = resources.length;
  const assignedResources = resources.filter(r => r.emergencyId).length;
  const activeAlerts = alerts.filter(a => !a.resolved).length;
  
  useEffect(() => {
    // Cargar datos al montar el componente
    dispatch(fetchEmergencies());
    dispatch(fetchResources());
    dispatch(fetchAlerts());
  }, [dispatch]);
  
  const handleRefresh = () => {
    dispatch(fetchEmergencies());
    dispatch(fetchResources());
    dispatch(fetchAlerts());
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleViewChange = (view) => {
    dispatch(setCurrentView(view));
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Verificar si los datos están cargando
  const isLoading = 
    emergenciesStatus === 'loading' || 
    resourcesStatus === 'loading' || 
    alertsStatus === 'loading';
    
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tauler Principal del Centre d'Emergències
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
      
      {/* Panel de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <StatPanel 
            title="Emergències Actives" 
            value={activeEmergencies} 
            color="error.main" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatPanel 
            title="Emergències Pendents" 
            value={pendingEmergencies} 
            color="warning.main" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatPanel 
            title="Emergències Resoltes" 
            value={resolvedEmergencies} 
            color="success.main" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatPanel 
            title="Recursos Totals" 
            value={totalResources} 
            color="info.main" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatPanel 
            title="Recursos Assignats" 
            value={assignedResources} 
            color="secondary.main" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatPanel 
            title="Alertes Actives" 
            value={activeAlerts} 
            color="error.main" 
          />
        </Grid>
      </Grid>
      
      {/* Tabs y filtros */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Emergències" />
            <Tab label="Recursos" />
            <Tab label="Alertes" />
          </Tabs>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Cercar..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ mr: 2 }}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
              }}
            />
            
            <Tooltip title="Filtrar">
              <IconButton>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            
            <Tooltip title="Vista de mapa">
              <IconButton 
                color={currentView === 'map' ? 'primary' : 'default'} 
                onClick={() => handleViewChange('map')}
              >
                <MapIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Vista de llista">
              <IconButton 
                color={currentView === 'list' ? 'primary' : 'default'}
                onClick={() => handleViewChange('list')}
              >
                <ListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
      
      {/* Contenido principal */}
      <Paper sx={{ p: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Vista de mapa para las emergencias */}
            {tabValue === 0 && currentView === 'map' && (
              <Box sx={{ height: 600 }}>
                <MapContainer center={[41.3851, 2.1734]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {filteredEmergencies.map(emergency => (
                    <Marker 
                      key={emergency.id} 
                      position={[emergency.latitude, emergency.longitude]}
                    >
                      <Popup>
                        <Typography variant="subtitle1">{emergency.title}</Typography>
                        <Typography variant="body2">{emergency.description}</Typography>
                        <Typography variant="caption">
                          Estat: 
                          <Chip 
                            size="small" 
                            label={emergency.status === 'active' ? 'Activa' : emergency.status === 'pending' ? 'Pendent' : 'Resolta'} 
                            color={emergency.status === 'active' ? 'error' : emergency.status === 'pending' ? 'warning' : 'success'} 
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Box>
            )}
            
            {/* Vista de lista para las emergencias */}
            {tabValue === 0 && currentView === 'list' && (
              <Box>
                {filteredEmergencies.length === 0 ? (
                  <Typography align="center" color="textSecondary" sx={{ py: 3 }}>
                    No s'han trobat emergències
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {filteredEmergencies.map(emergency => (
                      <Grid item xs={12} key={emergency.id}>
                        <Card variant="outlined">
                          <CardHeader
                            title={emergency.title}
                            subheader={`Ubicació: ${emergency.location}`}
                            action={
                              <Chip 
                                label={emergency.status === 'active' ? 'Activa' : emergency.status === 'pending' ? 'Pendent' : 'Resolta'} 
                                color={emergency.status === 'active' ? 'error' : emergency.status === 'pending' ? 'warning' : 'success'} 
                              />
                            }
                          />
                          <CardContent>
                            <Typography variant="body2" color="textSecondary">
                              {emergency.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
            
            {/* Contenido para recursos */}
            {tabValue === 1 && (
              <Typography>
                Contingut de recursos
              </Typography>
            )}
            
            {/* Contenido para alertas */}
            {tabValue === 2 && (
              <Typography>
                Contingut d'alertes
              </Typography>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard; 