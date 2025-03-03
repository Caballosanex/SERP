import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  IconButton,
  Alert
} from '@mui/material';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';

const MapComponent = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

const NovaEmergencia = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    location: '',
    type: '',
    priority: '',
    latitude: '',
    longitude: ''
  });

  const [openMap, setOpenMap] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData(prevState => ({
      ...prevState,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }));
    setOpenMap(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Crear nueva incidencia con ID único y fecha
    const newIncident = {
      ...formData,
      id: Date.now(),
      status: 'active',
      lastUpdate: new Date().toISOString()
    };

    // Obtener incidencias existentes del LocalStorage
    const existingIncidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    
    // Añadir nueva incidencia
    const updatedIncidents = [...existingIncidents, newIncident];
    
    // Guardar en LocalStorage
    localStorage.setItem('incidents', JSON.stringify(updatedIncidents));

    // Mostrar mensaje de éxito y limpiar el formulario
    setShowSuccess(true);
    setFormData({
      title: '',
      description: '',
      location: '',
      type: '',
      priority: '',
      latitude: '',
      longitude: ''
    });

    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Nova Emergència
      </Typography>
      
      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          L'emergència s'ha creat correctament!
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mt: 3 }} elevation={0}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Títol"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Descripció"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LocationOnIcon />}
                onClick={() => setOpenMap(true)}
              >
                Seleccionar Ubicació
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Latitud"
                name="latitude"
                value={formData.latitude}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Longitud"
                name="longitude"
                value={formData.longitude}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipus d'Emergència</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="Tipus d'Emergència"
                  onChange={handleChange}
                >
                  <MenuItem value="fire">Incendi</MenuItem>
                  <MenuItem value="medical">Emergència Mèdica</MenuItem>
                  <MenuItem value="accident">Accident</MenuItem>
                  <MenuItem value="natural">Desastre Natural</MenuItem>
                  <MenuItem value="other">Altres</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Prioritat</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  label="Prioritat"
                  onChange={handleChange}
                >
                  <MenuItem value="critical">Crítica</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="medium">Mitjana</MenuItem>
                  <MenuItem value="low">Baixa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined">
                  Cancel·lar
                </Button>
                <Button variant="contained" type="submit">
                  Crear Emergència
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Modal
        open={openMap}
        onClose={() => setOpenMap(false)}
        aria-labelledby="map-modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="map-modal-title" variant="h6" component="h2" gutterBottom>
            Selecciona una ubicació al mapa
          </Typography>
          <Box sx={{ height: '500px', width: '100%' }}>
            <MapContainer
              center={[41.3879, 2.16992]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapComponent onLocationSelect={handleLocationSelect} />
            </MapContainer>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default NovaEmergencia; 