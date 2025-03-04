import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
  Add as AddIcon
} from '@mui/icons-material';

const Seguiment = () => {
  const [emergencies, setEmergencies] = React.useState(() => {
    const savedIncidents = localStorage.getItem('incidents');
    if (savedIncidents) {
      return JSON.parse(savedIncidents);
    }
    return [];
  });

  const [openUpdateModal, setOpenUpdateModal] = React.useState(false);
  const [selectedEmergency, setSelectedEmergency] = React.useState(null);
  const [newUpdate, setNewUpdate] = React.useState('');

  // Actualizar emergencias cuando cambien en localStorage
  React.useEffect(() => {
    const handleStorageChange = () => {
      const savedIncidents = localStorage.getItem('incidents');
      if (savedIncidents) {
        setEmergencies(JSON.parse(savedIncidents));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleOpenUpdateModal = (emergency) => {
    setSelectedEmergency(emergency);
    setOpenUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setSelectedEmergency(null);
    setNewUpdate('');
    setOpenUpdateModal(false);
  };

  const handleAddUpdate = () => {
    if (!newUpdate.trim()) return;

    const updatedEmergencies = emergencies.map(emergency => {
      if (emergency.id === selectedEmergency.id) {
        const updates = emergency.updates || [];
        const newUpdates = [
          {
            id: Date.now(),
            time: new Date().toISOString(),
            message: newUpdate.trim()
          },
          ...updates
        ].slice(0, 3); // Mantener solo las 3 últimas actualizaciones

        return {
          ...emergency,
          updates: newUpdates,
          lastUpdate: new Date().toISOString()
        };
      }
      return emergency;
    });

    setEmergencies(updatedEmergencies);
    localStorage.setItem('incidents', JSON.stringify(updatedEmergencies));
    handleCloseUpdateModal();
  };

  // Función para ordenar las emergencias
  const activeEmergencies = emergencies.filter(e => e.status === 'active');
  const resolvedEmergencies = emergencies.filter(e => e.status !== 'active');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Seguiment d'Emergències
        </Typography>
        <IconButton>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Emergencias Activas */}
      {activeEmergencies.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" color="text.secondary">
            Emergències Actives
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {activeEmergencies.map((emergency) => (
          <Grid item xs={12} key={emergency.id}>
            <Card>
              <CardHeader
                title={emergency.title}
                subheader={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon fontSize="small" />
                    <Typography variant="body2">
                      {emergency.location || 'No especificada'}
                    </Typography>
                  </Box>
                }
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={emergency.status === 'active' ? 'Activa' : 'Resolta'}
                      color={emergency.status === 'active' ? 'error' : 'success'}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleOpenUpdateModal(emergency)}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                }
              />
              <CardContent>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon color="action" />
                      <Typography variant="body2">
                        Última actualització: {new Date(emergency.lastUpdate).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupIcon color="action" />
                      <Typography variant="body2">
                        Prioritat: {
                          emergency.priority === 'critical' ? 'Crítica' :
                          emergency.priority === 'high' ? 'Alta' :
                          emergency.priority === 'medium' ? 'Mitjana' : 'Baixa'
                        }
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupIcon color="action" />
                      <Typography variant="body2">
                        Tipus: {
                          emergency.type === 'fire' ? 'Incendi' :
                          emergency.type === 'medical' ? 'Emergència Mèdica' :
                          emergency.type === 'accident' ? 'Accident' :
                          emergency.type === 'natural' ? 'Desastre Natural' : 'Altres'
                        }
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" gutterBottom>
                  Últimes Actualitzacions {emergency.updates ? `(${emergency.updates.length}/3)` : '(0/3)'}
                </Typography>
                <List>
                  {(emergency.updates || []).slice(0, 3).map((update, index) => (
                    <React.Fragment key={update.id}>
                      <ListItem>
                        <ListItemIcon>
                          <AccessTimeIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={update.message}
                          secondary={new Date(update.time).toLocaleString()}
                        />
                      </ListItem>
                      {index < Math.min((emergency.updates || []).length - 1, 2) && <Divider />}
                    </React.Fragment>
                  ))}
                  {(!emergency.updates || emergency.updates.length === 0) && (
                    <ListItem>
                      <ListItemText
                        primary="No hi ha actualitzacions"
                        secondary="Afegeix la primera actualització fent clic al botó +"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Separador y título para emergencias resueltas */}
      {resolvedEmergencies.length > 0 && (
        <>
          <Box sx={{ mt: 6, mb: 3 }}>
            <Typography variant="h5" color="text.secondary">
              Emergències Resoltes
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {resolvedEmergencies.map((emergency) => (
              <Grid item xs={12} md={6} key={emergency.id}>
                <Card sx={{ opacity: 0.8, transform: 'scale(0.95)' }}>
                  <CardHeader
                    title={
                      <Typography variant="h6">
                        {emergency.title}
                      </Typography>
                    }
                    subheader={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" />
                        <Typography variant="body2">
                          {emergency.location || 'No especificada'}
                        </Typography>
                      </Box>
                    }
                    action={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label="Resolta"
                          color="success"
                          size="small"
                        />
                      </Box>
                    }
                  />
                  <CardContent>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            Última actualització: {new Date(emergency.lastUpdate).toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Dialog open={openUpdateModal} onClose={handleCloseUpdateModal} maxWidth="sm" fullWidth>
        <DialogTitle>Afegir Actualització</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nova actualització"
            fullWidth
            multiline
            rows={4}
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateModal}>Cancel·lar</Button>
          <Button onClick={handleAddUpdate} variant="contained" color="primary">
            Afegir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Seguiment; 