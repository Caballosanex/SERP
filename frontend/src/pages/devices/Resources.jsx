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
  Search as SearchIcon
} from '@mui/icons-material';

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

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    type: '',
    status: 'disponible',
    location: '',
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
          location: 'Barcelona',
          lastUpdate: '2024-03-03T12:00:00'
        },
        {
          id: 2,
          name: 'Patrulla 1',
          type: 'policia',
          status: 'disponible',
          location: 'Barcelona',
          lastUpdate: '2024-03-03T13:30:00'
        },
        {
          id: 3,
          name: 'Camión Bomberos 1',
          type: 'bombero',
          status: 'disponible',
          location: 'Barcelona',
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
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewResource(prev => ({
      ...prev,
      [name]: value
    }));
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
            <TextField
              fullWidth
              label="Ubicació"
              name="location"
              value={newResource.location}
              onChange={handleInputChange}
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