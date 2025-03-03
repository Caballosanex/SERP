import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';

const QoDSessionModal = ({ visible, onCancel, deviceId, onSuccess }) => {
  const [formValues, setFormValues] = useState({
    profile: '',
    duration: 3600
  });
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Mostrar mensaje
  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Cargar los perfiles QoD disponibles
  useEffect(() => {
    if (visible && deviceId) {
      fetchQoDProfiles();
      // Reset form
      setFormValues({
        profile: '',
        duration: 3600
      });
      setErrors({});
    }
  }, [visible, deviceId]);

  const fetchQoDProfiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/devices/qod/profiles`);
      if (response.data && response.data.profiles) {
        setProfiles(response.data.profiles);
      }
    } catch (error) {
      console.error('Error al cargar los perfiles QoD:', error);
      showMessage('Error al cargar los perfiles QoD disponibles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    // Clear error when user changes value
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formValues.profile) {
      newErrors.profile = 'Por favor, selecciona un perfil';
    }
    
    if (!formValues.duration) {
      newErrors.duration = 'Por favor, introduce la duración';
    } else if (formValues.duration < 60) {
      newErrors.duration = 'La duración mínima es de 60 segundos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/devices/${deviceId}/qod`,
        null,
        {
          params: {
            profile: formValues.profile,
            duration: formValues.duration,
          },
        }
      );
      showMessage('Sesión QoD creada correctamente');
      onCancel();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error al crear la sesión QoD:', error);
      showMessage('Error al crear la sesión QoD', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={visible}
        onClose={onCancel}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Crear sesión QoD</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              <FormControl 
                fullWidth 
                margin="normal"
                error={!!errors.profile}
              >
                <InputLabel id="profile-label">Perfil QoD</InputLabel>
                <Select
                  labelId="profile-label"
                  name="profile"
                  value={formValues.profile}
                  onChange={handleChange}
                  label="Perfil QoD"
                >
                  {profiles.map(profile => (
                    <MenuItem key={profile} value={profile}>
                      {profile}
                    </MenuItem>
                  ))}
                </Select>
                {errors.profile && (
                  <Typography color="error" variant="caption">
                    {errors.profile}
                  </Typography>
                )}
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Duración (segundos)"
                name="duration"
                type="number"
                value={formValues.duration}
                onChange={handleChange}
                error={!!errors.duration}
                helperText={errors.duration}
                inputProps={{ min: 60, step: 300 }}
              />

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Información sobre perfiles</Typography>
                <Typography variant="body2">Los perfiles determinan la calidad del servicio:</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="DOWNLINK_S_UPLINK_S" 
                      secondary="Bajo ancho de banda tanto de subida como de bajada" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="DOWNLINK_XL_UPLINK_L" 
                      secondary="Alto ancho de banda tanto de subida como de bajada" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      secondary="Otros perfiles ofrecen combinaciones intermedias (S: Pequeño, M: Mediano, L: Grande, XL: Extra grande)" 
                    />
                  </ListItem>
                </List>
                <Typography variant="body2">La duración predeterminada es de 1 hora (3600 segundos)</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default QoDSessionModal; 