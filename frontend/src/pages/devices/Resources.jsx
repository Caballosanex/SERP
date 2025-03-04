import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Chip,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Search as SearchIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const MapComponent = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

// Función para convertir un componente SVG a URL de datos
const svgToDataUrl = (svgPath, color = '#FF0000') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="11" fill="white" stroke="${color}" stroke-width="1"/>
      <g transform="scale(0.7) translate(5, 5)">
        ${svgPath}
      </g>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Definir los paths SVG para cada icono de recurso
const resourceIconPaths = {
  ambulancia: '<path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>',
  policia: '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.83-2.61 9.18-7 10.93-4.39-1.75-7-6.1-7-10.93v-4.7l7-3.12z"/>',
  bombero: '<path d="M19.48 12.35c-1.57-4.08-7.16-4.3-5.81-10.23.1-.44-.37-.78-.75-.55C9.29 3.71 6.68 8 8.87 13.62c.18.46-.36.89-.75.59-1.81-1.37-2-3.34-1.84-4.75.06-.52-.62-.77-.91-.34C4.69 10.16 4 11.84 4 14.37c.38 5.6 5.11 7.32 6.81 7.54 2.43.31 5.06-.14 6.95-1.87 2.08-1.93 2.84-5.01 1.72-7.69zm-9.28 5.03c1.44-.35 2.18-1.39 2.38-2.31.33-1.43-.96-2.83-.09-5.09.33 1.87 3.27 3.04 3.27 5.08.08 2.53-2.66 4.7-5.56 2.32z"/>'
};

// Crear iconos personalizados para cada tipo de recurso
const resourceIcons = {
  ambulancia: L.icon({
    iconUrl: svgToDataUrl(resourceIconPaths.ambulancia, '#4CAF50'),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  policia: L.icon({
    iconUrl: svgToDataUrl(resourceIconPaths.policia, '#1976D2'),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  bombero: L.icon({
    iconUrl: svgToDataUrl(resourceIconPaths.bombero, '#FF4444'),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
};

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    type: '',
    status: 'disponible',
    location: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    // Cargar recursos desde localStorage
    const storedResources = localStorage.getItem('resources');
    if (storedResources) {
      setResources(JSON.parse(storedResources));
    } else {
      // Si no hay recursos en localStorage, usar los datos de ejemplo
      const mockResources = [
        {
          id: 1,
          name: 'Ambulancia 1',
          type: 'ambulancia',
          status: 'disponible',
          location: '41.3879, 2.16992',
          latitude: 41.3879,
          longitude: 2.16992,
          lastUpdate: '2024-03-03T12:00:00'
        },
        {
          id: 2,
          name: 'Patrulla 1',
          type: 'policia',
          status: 'disponible',
          location: '41.3851, 2.1734',
          latitude: 41.3851,
          longitude: 2.1734,
          lastUpdate: '2024-03-03T13:30:00'
        },
        {
          id: 3,
          name: 'Camión Bomberos 1',
          type: 'bombero',
          status: 'disponible',
          location: '41.3902, 2.1647',
          latitude: 41.3902,
          longitude: 2.1647,
          lastUpdate: '2024-03-03T14:15:00'
        }
      ];
      setResources(mockResources);
      localStorage.setItem('resources', JSON.stringify(mockResources));
    }
    setIsLoading(false);
  }, []);

  const handleModalOpen = () => setOpenModal(true);
  const handleModalClose = () => {
    setOpenModal(false);
    setNewResource({
      name: '',
      type: '',
      status: 'disponible',
      location: '',
      latitude: '',
      longitude: '',
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewResource(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (lat, lng) => {
    setNewResource(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }));
    setOpenMap(false);
  };

  const handleAddResource = () => {
    const newResourceWithId = {
      ...newResource,
      id: resources.length + 1,
      lastUpdate: new Date().toISOString()
    };
    
    const updatedResources = [...resources, newResourceWithId];
    setResources(updatedResources);
    localStorage.setItem('resources', JSON.stringify(updatedResources));
    handleModalClose();
  };

  const handleRefresh = () => {
    setIsLoading(true);
    const storedResources = localStorage.getItem('resources');
    if (storedResources) {
      setResources(JSON.parse(storedResources));
    }
    setIsLoading(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponible':
        return 'success';
      case 'ocupado':
        return 'error';
      case 'mantenimiento':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestió de Recursos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleModalOpen}
          >
            Nou Recurs
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
            sx={{
              '&:disabled': {
                backgroundColor: 'action.disabledBackground',
              }
            }}
          >
            {isLoading ? 'Actualitzant...' : 'Actualitzar'}
          </Button>
        </Box>
      </Box>

      <Modal
        open={openModal}
        onClose={handleModalClose}
        aria-labelledby="modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 3 }}>
            Afegir Nou Recurs
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Nom"
              name="name"
              value={newResource.name}
              onChange={handleInputChange}
            />
            <FormControl fullWidth>
              <InputLabel>Tipus</InputLabel>
              <Select
                name="type"
                value={newResource.type}
                label="Tipus"
                onChange={handleInputChange}
              >
                <MenuItem value="ambulancia">Ambulància</MenuItem>
                <MenuItem value="policia">Policia</MenuItem>
                <MenuItem value="bombero">Bomber</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Estat</InputLabel>
              <Select
                name="status"
                value={newResource.status}
                label="Estat"
                onChange={handleInputChange}
              >
                <MenuItem value="disponible">Disponible</MenuItem>
                <MenuItem value="ocupado">Ocupat</MenuItem>
                <MenuItem value="mantenimiento">Manteniment</MenuItem>
              </Select>
            </FormControl>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<LocationOnIcon />}
              onClick={() => setOpenMap(true)}
            >
              Seleccionar Ubicació
            </Button>
            <TextField
              fullWidth
              label="Latitud"
              name="latitude"
              value={newResource.latitude}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              fullWidth
              label="Longitud"
              name="longitude"
              value={newResource.longitude}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              fullWidth
              label="Ubicació"
              name="location"
              value={newResource.location}
              InputProps={{
                readOnly: true,
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={handleModalClose}>Cancel·lar</Button>
              <Button 
                variant="contained" 
                onClick={handleAddResource}
                disabled={!newResource.name || !newResource.type || !newResource.location}
              >
                Afegir
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openMap}
        onClose={() => setOpenMap(false)}
        aria-labelledby="map-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>
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
              {resources.map((resource) => (
                <Marker
                  key={resource.id}
                  position={[resource.latitude, resource.longitude]}
                  icon={resourceIcons[resource.type] || resourceIcons.ambulancia}
                >
                  <Popup>
                    <Box sx={{ p: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {resource.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Tipus: {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" sx={{ mr: 1 }}>
                          Estat:
                        </Typography>
                        <Chip
                          size="small"
                          label={resource.status}
                          color={getStatusColor(resource.status)}
                          sx={{
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Última actualització: {new Date(resource.lastUpdate).toLocaleString()}
                      </Typography>
                    </Box>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Box>
        </Box>
      </Modal>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Cercar recursos..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 3 }}
        />

        <Grid container spacing={3}>
          {filteredResources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              <Card>
                <CardHeader
                  title={resource.name}
                  subheader={`Tipus: ${resource.type}`}
                  action={
                    <Chip
                      label={resource.status}
                      color={getStatusColor(resource.status)}
                      size="small"
                    />
                  }
                />
                <CardContent sx={{ position: 'relative', pb: '16px !important' }}>
                  <Typography variant="body2" color="text.secondary">
                    Ubicació: {resource.location}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Última actualització: {new Date(resource.lastUpdate).toLocaleString()}
                  </Typography>
                  <Box sx={{ 
                    position: 'absolute',
                    bottom: '8px',
                    right: '16px'
                  }}>
                    <img 
                      src={`${process.env.PUBLIC_URL}/resources/${
                           resource.type === 'ambulancia' ? 'Ambulancia.png' : 
                           resource.type === 'policia' ? 'Policia.png' : 
                           resource.type === 'bombero' ? 'Bomberos.png' : ''}`}
                      alt={`Icono de ${resource.type}`}
                      style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                      onError={(e) => {
                        console.error('Error loading image:', e.target.src);
                        console.log('Resource type:', resource.type);
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Resources; 