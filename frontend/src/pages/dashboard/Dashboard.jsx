import React, { useEffect, useState } from 'react';
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

// Panel de estadísticas
const StatPanel = ({ title, value, color }) => (
  <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '150px'  // Altura mínima fija para todos los paneles
    }}>
      <Typography 
        variant="h6" 
        color="textSecondary" 
        sx={{ 
          minHeight: '48px',  // Altura fija para el título
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="h3" 
        color={color} 
        align="center"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1
        }}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

// Componente de dashboard
const Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('list');
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para los datos
  const [emergencies, setEmergencies] = useState([]);
  const [resources, setResources] = useState([]);

  // Cargar y sincronizar datos desde localStorage
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      try {
        // Cargar emergencias
        const savedIncidents = localStorage.getItem('incidents');
        if (savedIncidents) {
          setEmergencies(JSON.parse(savedIncidents));
        }
        
        // Cargar recursos
        const savedResources = localStorage.getItem('resources');
        if (savedResources) {
          setResources(JSON.parse(savedResources));
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
      setIsLoading(false);
    };

    // Cargar datos inicialmente
    loadData();

    // Escuchar cambios en localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'incidents') {
        const savedIncidents = localStorage.getItem('incidents');
        if (savedIncidents) {
          setEmergencies(JSON.parse(savedIncidents));
        }
      }
      if (e.key === 'resources') {
        const savedResources = localStorage.getItem('resources');
        if (savedResources) {
          setResources(JSON.parse(savedResources));
        }
      }
    };

    // Suscribirse a cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Filtrar emergencias por búsqueda
  const filteredEmergencies = emergencies.filter(emergency => 
    emergency.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emergency.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emergency.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Estadísticas
  const activeEmergencies = emergencies.filter(e => e.status === 'active').length;
  const pendingEmergencies = emergencies.filter(e => e.status === 'pending').length;
  const resolvedEmergencies = emergencies.filter(e => e.status === 'resolved').length;
  const totalResources = resources.length;
  const availableResources = resources.filter(r => r.status === 'disponible').length;
  const busyResources = resources.filter(r => r.status === 'ocupado').length;
  const maintenanceResources = resources.filter(r => r.status === 'mantenimiento').length;
  
  const handleRefresh = () => {
    const savedIncidents = localStorage.getItem('incidents');
    if (savedIncidents) {
      setEmergencies(JSON.parse(savedIncidents));
    }
    const savedResources = localStorage.getItem('resources');
    if (savedResources) {
      setResources(JSON.parse(savedResources));
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleViewChange = (view) => {
    setCurrentView(view);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
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
            title={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span>Recursos</span>
                <span>Totals</span>
              </Box>
            }
            value={totalResources} 
            color="info.main" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatPanel 
            title="Recursos Disponibles" 
            value={availableResources} 
            color="success.main" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatPanel 
            title="Recursos Ocupats" 
            value={busyResources} 
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
                  <>
                    {/* Título para emergencias activas y pendientes */}
                    <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                      Emergències Actives
                    </Typography>

                    {/* Emergencias activas y pendientes */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                      {filteredEmergencies
                        .filter(emergency => emergency.status !== 'resolved')
                        .map(emergency => (
                          <Grid item xs={12} key={emergency.id}>
                            <Card variant="outlined">
                              <CardHeader
                                title={emergency.title}
                                subheader={`Ubicació: ${emergency.location}`}
                                action={
                                  <Chip 
                                    label={emergency.status === 'active' ? 'Activa' : 'Pendent'} 
                                    color={emergency.status === 'active' ? 'error' : 'warning'} 
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

                    {/* Separador y título para emergencias resueltas */}
                    {filteredEmergencies.some(e => e.status === 'resolved') && (
                      <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                          Emergències Resoltes
                        </Typography>
                      </>
                    )}

                    {/* Emergencias resueltas */}
                    <Grid container spacing={1}>
                      {filteredEmergencies
                        .filter(emergency => emergency.status === 'resolved')
                        .map(emergency => (
                          <Grid item xs={12} sm={6} md={4} key={emergency.id}>
                            <Card variant="outlined" sx={{ opacity: 0.8 }}>
                              <CardHeader
                                title={
                                  <Typography variant="subtitle1">
                                    {emergency.title}
                                  </Typography>
                                }
                                subheader={
                                  <Typography variant="caption">
                                    {`Ubicació: ${emergency.location}`}
                                  </Typography>
                                }
                                action={
                                  <Chip 
                                    size="small"
                                    label="Resolta" 
                                    color="success" 
                                  />
                                }
                              />
                              <CardContent sx={{ py: 1 }}>
                                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                                  {emergency.description}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Box>
            )}
            
            {/* Contenido para recursos */}
            {tabValue === 1 && (
              <Box>
                {resources.length === 0 ? (
                  <Typography align="center" color="textSecondary" sx={{ py: 3 }}>
                    No s'han trobat recursos
                  </Typography>
                ) : (
                  <Grid container spacing={3}>
                    {resources.map((resource) => (
                      <Grid item xs={12} sm={6} md={4} key={resource.id}>
                        <Card>
                          <CardHeader
                            title={resource.name}
                            subheader={`Tipus: ${resource.type}`}
                            action={
                              <Chip
                                label={resource.status}
                                color={resource.status === 'disponible' ? 'success' : 
                                       resource.status === 'ocupado' ? 'error' : 'warning'}
                                size="small"
                              />
                            }
                          />
                          <CardContent>
                            <Typography variant="body2" color="text.secondary">
                              Ubicació: {resource.location}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              Última actualització: {new Date(resource.lastUpdate).toLocaleString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard; 