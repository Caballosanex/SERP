import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableSortLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

const EditorIncidents = () => {
  const [incidents, setIncidents] = React.useState([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedIncident, setSelectedIncident] = React.useState(null);
  const [orderDirection, setOrderDirection] = React.useState('desc');
  const [editForm, setEditForm] = React.useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    type: ''
  });

  // Cargar incidencias del LocalStorage
  useEffect(() => {
    try {
      const storedIncidents = JSON.parse(localStorage.getItem('incidents') || '[]');
      console.log('Incidencias almacenadas:', storedIncidents);
      const sortedIncidents = sortIncidents(storedIncidents, 'desc');
      setIncidents(sortedIncidents);
    } catch (error) {
      console.error('Error al cargar las incidencias:', error);
      setIncidents([]);
    }
  }, []);

  // Función auxiliar para ordenar incidencias
  const sortIncidents = (incidentsList, direction) => {
    return [...incidentsList].sort((a, b) => {
      // Primero ordenar por estado (activos arriba, resueltos abajo)
      if (a.status !== b.status) {
        return a.status === 'resolved' ? 1 : -1;
      }

      // Si ambos tienen el mismo estado, ordenar por prioridad
      const priorityOrder = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1
      };
      
      if (direction === 'asc') {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  // Función para ordenar incidencias
  const handleSort = () => {
    const newDirection = orderDirection === 'asc' ? 'desc' : 'asc';
    const sortedIncidents = sortIncidents(incidents, newDirection);
    setIncidents(sortedIncidents);
    setOrderDirection(newDirection);
  };

  const handleEditClick = (incident) => {
    setSelectedIncident(incident);
    setEditForm({
      title: incident.title,
      description: incident.description,
      status: incident.status,
      priority: incident.priority,
      type: incident.type
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedIncident(null);
    setEditForm({
      title: '',
      description: '',
      status: '',
      priority: '',
      type: ''
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = () => {
    const updatedIncidents = incidents.map(incident => {
      if (incident.id === selectedIncident.id) {
        // Si el estado es 'resolved', ignoramos la prioridad seleccionada
        const updatedIncident = {
          ...incident,
          ...editForm,
          lastUpdate: new Date().toISOString()
        };
        
        // Si el estado es 'resolved', forzamos la prioridad a 'resolved'
        if (editForm.status === 'resolved') {
          updatedIncident.priority = 'resolved';
          
          // Si hay un recurso asignado, lo marcamos como disponible
          if (incident.selectedResource) {
            const storedResources = JSON.parse(localStorage.getItem('resources') || '[]');
            const updatedResources = storedResources.map(resource => {
              if (resource.id === parseInt(incident.selectedResource)) {
                return { ...resource, status: 'disponible' };
              }
              return resource;
            });
            localStorage.setItem('resources', JSON.stringify(updatedResources));
          }
        }
        
        return updatedIncident;
      }
      return incident;
    });

    localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
    // Aplicar el ordenamiento después de guardar
    const sortedIncidents = sortIncidents(updatedIncidents, orderDirection);
    setIncidents(sortedIncidents);
    handleCloseDialog();
  };

  const handleDelete = (incidentId) => {
    const updatedIncidents = incidents.filter(incident => incident.id !== incidentId);
    localStorage.setItem('incidents', JSON.stringify(updatedIncidents));
    setIncidents(updatedIncidents);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Editor d'Emergències
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Títol</TableCell>
              <TableCell>Descripció</TableCell>
              <TableCell>Estat</TableCell>
              <TableCell>
                <TableSortLabel
                  active={true}
                  direction={orderDirection}
                  onClick={handleSort}
                >
                  Prioritat
                </TableSortLabel>
              </TableCell>
              <TableCell>Tipus</TableCell>
              <TableCell>Última Actualització</TableCell>
              <TableCell>Accions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell>{incident.title}</TableCell>
                <TableCell>{incident.description}</TableCell>
                <TableCell>
                  <Chip
                    label={incident.status === 'active' ? 'Actiu' : 'Resolt'}
                    color={incident.status === 'active' ? 'error' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      incident.status === 'resolved' ? 'Resolt' :
                      incident.priority === 'critical' ? 'Crítica' :
                      incident.priority === 'high' ? 'Alta' :
                      incident.priority === 'medium' ? 'Mitjana' : 'Baixa'
                    }
                    color={
                      incident.status === 'resolved' ? 'success' :
                      incident.priority === 'critical' ? 'error' :
                      incident.priority === 'high' ? 'warning' :
                      incident.priority === 'medium' ? 'warning' : 'info'
                    }
                    sx={{
                      '&.MuiChip-root': {
                        backgroundColor: 
                          incident.status === 'resolved' ? '#4caf50' :
                          incident.priority === 'critical' ? '#ff0000' :
                          incident.priority === 'high' ? '#ff9800' :
                          incident.priority === 'medium' ? '#ffeb3b' : '#2196f3',
                        color: 'white'
                      }
                    }}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      incident.type === 'fire' ? 'Incendi' :
                      incident.type === 'medical' ? 'Emergència Mèdica' :
                      incident.type === 'accident' ? 'Accident' :
                      incident.type === 'natural' ? 'Desastre Natural' : 'Altres'
                    }
                    color="default"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(incident.lastUpdate).toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEditClick(incident)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(incident.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Incident</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Títol"
                  name="title"
                  value={editForm.title}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Descripció"
                  name="description"
                  value={editForm.description}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Estat</InputLabel>
                  <Select
                    name="status"
                    value={editForm.status}
                    label="Estat"
                    onChange={handleFormChange}
                  >
                    <MenuItem value="active">Actiu</MenuItem>
                    <MenuItem value="resolved">Resolt</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Prioritat</InputLabel>
                  <Select
                    name="priority"
                    value={editForm.priority}
                    label="Prioritat"
                    onChange={handleFormChange}
                  >
                    <MenuItem value="critical">Crítica</MenuItem>
                    <MenuItem value="high">Alta</MenuItem>
                    <MenuItem value="medium">Mitjana</MenuItem>
                    <MenuItem value="low">Baixa</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipus d'Emergència</InputLabel>
                  <Select
                    name="type"
                    value={editForm.type}
                    label="Tipus d'Emergència"
                    onChange={handleFormChange}
                  >
                    <MenuItem value="fire">Incendi</MenuItem>
                    <MenuItem value="medical">Emergència Mèdica</MenuItem>
                    <MenuItem value="accident">Accident</MenuItem>
                    <MenuItem value="natural">Desastre Natural</MenuItem>
                    <MenuItem value="other">Altres</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel·lar</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditorIncidents; 