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
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  NotificationsActive as AlertIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { fetchEmergencies, createEmergency, updateEmergency, resolveEmergency, assignResourcesToEmergency } from '../../redux/slices/emergenciesSlice';
import { fetchResources } from '../../redux/slices/resourcesSlice';
import { fetchAlerts, resolveAlert } from '../../redux/slices/alertsSlice';

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

// Componente de tarjeta de emergencia
const EmergencyCard = ({ emergency, onAssign, onUpdate, onResolve }) => {
  const statusLabels = {
    active: 'Activa',
    pending: 'Pendent',
    resolved: 'Resolta'
  };
  
  return (
    <Card elevation={3} sx={{ mb: 2 }}>
      <CardHeader 
        title={emergency.title}
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">{emergency.location}</Typography>
            <TimeIcon fontSize="small" sx={{ ml: 2, mr: 0.5 }} />
            <Typography variant="body2">
              {new Date(emergency.timestamp).toLocaleString('ca-ES')}
            </Typography>
          </Box>
        }
        action={
          <Chip 
            label={statusLabels[emergency.status]} 
            color={emergency.status === 'active' ? 'error' : emergency.status === 'pending' ? 'warning' : 'success'}
            size="small"
          />
        }
      />
      <CardContent>
        <Typography variant="body1" paragraph>
          {emergency.description}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Informació de contacte:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">{emergency.contactPhone}</Typography>
            </Box>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Recursos assignats: {emergency.assignedResources?.length || 0}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {emergency.status !== 'resolved' && (
            <>
              <Button 
                size="small" 
                startIcon={<AssignmentIcon />} 
                variant="outlined"
                onClick={() => onAssign(emergency.id)}
              >
                Assignar recursos
              </Button>
              <Button 
                size="small" 
                startIcon={<EditIcon />} 
                variant="outlined"
                onClick={() => onUpdate(emergency.id)}
              >
                Actualitzar
              </Button>
              <Button 
                size="small" 
                startIcon={<CheckIcon />} 
                variant="contained" 
                color="success"
                onClick={() => onResolve(emergency.id)}
              >
                Resoldre
              </Button>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Componente principal del dashboard
const EmergencyOperatorDashboard = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedEmergencyId, setSelectedEmergencyId] = useState(null);
  const [selectedResources, setSelectedResources] = useState([]);
  const [newEmergency, setNewEmergency] = useState({
    title: '',
    description: '',
    location: '',
    contactPhone: '',
    latitude: 41.3851,
    longitude: 2.1734,
    status: 'active'
  });
  const [updateEmergencyData, setUpdateEmergencyData] = useState({
    status: 'pending',
    description: ''
  });
  
  const emergencies = useSelector(state => state.emergencies.emergencies);
  const emergenciesStatus = useSelector(state => state.emergencies.status);
  const resources = useSelector(state => state.resources.resources);
  const resourcesStatus = useSelector(state => state.resources.status);
  const alerts = useSelector(state => state.alerts.alerts);
  const alertsStatus = useSelector(state => state.alerts.status);
  
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
  const availableResources = resources.filter(r => !r.emergencyId).length;
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
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleAssignResources = (emergencyId) => {
    setSelectedEmergencyId(emergencyId);
    setDialogType('assign');
    setOpenDialog(true);
  };
  
  const handleUpdateEmergency = (emergencyId) => {
    const emergency = emergencies.find(e => e.id === emergencyId);
    if (emergency) {
      setUpdateEmergencyData({
        status: emergency.status,
        description: emergency.description
      });
    }
    setSelectedEmergencyId(emergencyId);
    setDialogType('update');
    setOpenDialog(true);
  };
  
  const handleResolveEmergency = (emergencyId) => {
    setSelectedEmergencyId(emergencyId);
    setDialogType('resolve');
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmergencyId(null);
    setSelectedResources([]);
  };
  
  const handleResourceSelection = (event) => {
    setSelectedResources(event.target.value);
  };
  
  const handleNewEmergencyChange = (event) => {
    const { name, value } = event.target;
    setNewEmergency(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleUpdateEmergencyChange = (event) => {
    const { name, value } = event.target;
    setUpdateEmergencyData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleConfirmDialog = () => {
    // Aquí se implementaría la lógica para cada tipo de acción
    if (dialogType === 'assign') {
      console.log(`Assignant recursos ${selectedResources} a l'emergència ${selectedEmergencyId}`);
      dispatch(assignResourcesToEmergency({ emergencyId: selectedEmergencyId, resourceIds: selectedResources }));
    } else if (dialogType === 'update') {
      console.log(`Actualitzant emergència ${selectedEmergencyId}`, updateEmergencyData);
      dispatch(updateEmergency({ 
        id: selectedEmergencyId, 
        emergencyData: updateEmergencyData
      }));
    } else if (dialogType === 'resolve') {
      console.log(`Resolent emergència ${selectedEmergencyId}`);
      dispatch(resolveEmergency(selectedEmergencyId));
    } else if (dialogType === 'create') {
      // Aquí se implementaría la lógica para crear una nueva emergencia
      console.log('Creant nova emergència', newEmergency);
      dispatch(createEmergency({
        ...newEmergency,
        timestamp: new Date().toISOString()
      }));
      
      // Resetear el formulario
      setNewEmergency({
        title: '',
        description: '',
        location: '',
        contactPhone: '',
        latitude: 41.3851,
        longitude: 2.1734,
        status: 'active'
      });
    }
    
    handleCloseDialog();
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
          Tauler d'Operador d'Emergències
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
            title="Recursos Disponibles" 
            value={availableResources} 
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
      
      {/* Tabs y búsqueda */}
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
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
              }}
            />
            
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              sx={{ ml: 2 }}
              onClick={() => {
                setDialogType('create');
                setOpenDialog(true);
              }}
            >
              Nova Emergència
            </Button>
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
            {/* Tab de Emergencias */}
            {tabValue === 0 && (
              <Box>
                {filteredEmergencies.length === 0 ? (
                  <Alert severity="info">No s'han trobat emergències</Alert>
                ) : (
                  filteredEmergencies.map(emergency => (
                    <EmergencyCard 
                      key={emergency.id}
                      emergency={emergency}
                      onAssign={handleAssignResources}
                      onUpdate={handleUpdateEmergency}
                      onResolve={handleResolveEmergency}
                    />
                  ))
                )}
              </Box>
            )}
            
            {/* Tab de Recursos */}
            {tabValue === 1 && (
              <Box>
                <List>
                  {resources.length === 0 ? (
                    <Alert severity="info">No s'han trobat recursos</Alert>
                  ) : (
                    resources.map(resource => (
                      <ListItem 
                        key={resource.id}
                        secondaryAction={
                          <Chip 
                            label={resource.emergencyId ? 'Assignat' : 'Disponible'} 
                            color={resource.emergencyId ? 'secondary' : 'success'} 
                            size="small"
                          />
                        }
                      >
                        <ListItemIcon>
                          {resource.type === 'ambulance' ? (
                            <PhoneIcon />
                          ) : resource.type === 'police' ? (
                            <LocationIcon />
                          ) : (
                            <TimeIcon />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={resource.name} 
                          secondary={`Tipus: ${resource.type} | Ubicació: ${resource.location}`} 
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Box>
            )}
            
            {/* Tab de Alertas */}
            {tabValue === 2 && (
              <Box>
                <List>
                  {alerts.length === 0 ? (
                    <Alert severity="info">No s'han trobat alertes</Alert>
                  ) : (
                    alerts.map(alert => (
                      <ListItem 
                        key={alert.id}
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            color={alert.resolved ? 'default' : 'error'}
                            disabled={alert.resolved}
                            onClick={() => {
                              console.log(`Marcant alerta ${alert.id} com resolta`);
                              dispatch(resolveAlert(alert.id));
                            }}
                          >
                            {alert.resolved ? <CheckIcon /> : <AlertIcon />}
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <AlertIcon color={alert.resolved ? 'disabled' : 'error'} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={alert.title} 
                          secondary={`${alert.description} | ${new Date(alert.timestamp).toLocaleString('ca-ES')}`} 
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Box>
            )}
          </>
        )}
      </Paper>
      
      {/* Diálogos */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'assign' && 'Assignar Recursos'}
          {dialogType === 'update' && 'Actualitzar Emergència'}
          {dialogType === 'resolve' && 'Resoldre Emergència'}
          {dialogType === 'create' && 'Crear Nova Emergència'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'assign' && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Recursos Disponibles</InputLabel>
              <Select
                multiple
                value={selectedResources}
                onChange={handleResourceSelection}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const resource = resources.find(r => r.id === value);
                      return (
                        <Chip key={value} label={resource?.name || value} />
                      );
                    })}
                  </Box>
                )}
              >
                {resources
                  .filter(resource => !resource.emergencyId)
                  .map(resource => (
                    <MenuItem key={resource.id} value={resource.id}>
                      {resource.name} - {resource.type}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
          
          {dialogType === 'update' && (
            <Box component="form" sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Estat</InputLabel>
                    <Select
                      name="status"
                      value={updateEmergencyData.status}
                      onChange={handleUpdateEmergencyChange}
                      label="Estat"
                    >
                      <MenuItem value="active">Activa</MenuItem>
                      <MenuItem value="pending">Pendent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripció actualitzada"
                    name="description"
                    value={updateEmergencyData.description}
                    onChange={handleUpdateEmergencyChange}
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          
          {dialogType === 'resolve' && (
            <Typography>
              Estàs segur que vols marcar aquesta emergència com a resolta?
            </Typography>
          )}
          
          {dialogType === 'create' && (
            <Box component="form" sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Títol"
                    name="title"
                    value={newEmergency.title}
                    onChange={handleNewEmergencyChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripció"
                    name="description"
                    value={newEmergency.description}
                    onChange={handleNewEmergencyChange}
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ubicació"
                    name="location"
                    value={newEmergency.location}
                    onChange={handleNewEmergencyChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telèfon de contacte"
                    name="contactPhone"
                    value={newEmergency.contactPhone}
                    onChange={handleNewEmergencyChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Latitud"
                    name="latitude"
                    type="number"
                    value={newEmergency.latitude}
                    onChange={handleNewEmergencyChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Longitud"
                    name="longitude"
                    type="number"
                    value={newEmergency.longitude}
                    onChange={handleNewEmergencyChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Estat</InputLabel>
                    <Select
                      name="status"
                      value={newEmergency.status}
                      onChange={handleNewEmergencyChange}
                      label="Estat"
                    >
                      <MenuItem value="active">Activa</MenuItem>
                      <MenuItem value="pending">Pendent</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CloseIcon />}>
            Cancel·lar
          </Button>
          <Button 
            onClick={handleConfirmDialog} 
            variant="contained" 
            color="primary"
            startIcon={<CheckIcon />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyOperatorDashboard;
