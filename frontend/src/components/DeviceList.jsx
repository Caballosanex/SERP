import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Snackbar, Alert, Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Wifi as WifiIcon
} from '@mui/icons-material';
import axios from 'axios';
import DeviceForm from './DeviceForm';
import QoDSessionModal from './QoDSessionModal';

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDevice, setCurrentDevice] = useState(null);
  const [isQoDModalVisible, setIsQoDModalVisible] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Mostrar mensaje
  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Cargar lista de dispositivos
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/devices`);
      setDevices(response.data);
    } catch (error) {
      console.error('Error al cargar los dispositivos:', error);
      showMessage('Error al cargar los dispositivos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Obtener estado del dispositivo
  const getDeviceStatus = async (deviceId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/devices/${deviceId}/status`);
      showMessage(`Estado del dispositivo: ${response.data.status}`);
      fetchDevices(); // Actualizar lista para reflejar el nuevo estado
    } catch (error) {
      console.error('Error al obtener el estado del dispositivo:', error);
      showMessage('Error al obtener el estado del dispositivo', 'error');
    }
  };

  // Obtener ubicación del dispositivo
  const getDeviceLocation = async (deviceId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/devices/${deviceId}/location`);
      if (response.data && response.data.latitude && response.data.longitude) {
        showMessage(`Ubicación: Lat ${response.data.latitude}, Long ${response.data.longitude}`);
      } else {
        showMessage('No se pudo obtener la ubicación precisa del dispositivo', 'info');
      }
      fetchDevices(); // Actualizar lista para reflejar la nueva ubicación
    } catch (error) {
      console.error('Error al obtener la ubicación del dispositivo:', error);
      showMessage('Error al obtener la ubicación del dispositivo', 'error');
    }
  };

  // Eliminar dispositivo
  const confirmDeleteDevice = (device) => {
    setDeviceToDelete(device);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDevice = async () => {
    if (!deviceToDelete) return;
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/devices/${deviceToDelete.id}`);
      showMessage('Dispositivo eliminado correctamente');
      fetchDevices();
    } catch (error) {
      console.error('Error al eliminar el dispositivo:', error);
      showMessage('Error al eliminar el dispositivo', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
    }
  };

  // Gestión del modal de creación/edición
  const showAddModal = () => {
    setIsEditMode(false);
    setCurrentDevice(null);
    setIsModalVisible(true);
  };

  const showEditModal = (device) => {
    setIsEditMode(true);
    setCurrentDevice(device);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleDeviceFormSubmit = async (values) => {
    try {
      if (isEditMode) {
        await axios.patch(`${process.env.REACT_APP_API_URL}/devices/${currentDevice.id}`, values);
        showMessage('Dispositivo actualizado correctamente');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/devices`, values);
        showMessage('Dispositivo creado correctamente');
      }
      setIsModalVisible(false);
      fetchDevices();
    } catch (error) {
      console.error('Error al guardar el dispositivo:', error);
      showMessage('Error al guardar el dispositivo', 'error');
    }
  };

  // Mostrar modal para gestionar sesión QoD
  const showQoDModal = (deviceId) => {
    setSelectedDeviceId(deviceId);
    setIsQoDModalVisible(true);
  };

  const handleQoDModalCancel = () => {
    setIsQoDModalVisible(false);
    setSelectedDeviceId(null);
  };

  // Eliminar sesión QoD activa
  const deleteQoDSession = async (deviceId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/devices/${deviceId}/qod`);
      showMessage('Sesión QoD eliminada correctamente');
      fetchDevices();
    } catch (error) {
      console.error('Error al eliminar la sesión QoD:', error);
      showMessage('Error al eliminar la sesión QoD', 'error');
    }
  };

  // Obtener color para el chip de estado
  const getStatusColor = (status) => {
    if (status === 'online') return 'success';
    if (status === 'offline') return 'error';
    return 'default';
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dispositivos registrados</h2>
        <div>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={showAddModal}
            style={{ marginRight: '8px' }}
          >
            Añadir dispositivo
          </Button>
          <Button 
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDevices}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Número de teléfono</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Última ubicación</TableCell>
                <TableCell>Sesión QoD</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>{device.id}</TableCell>
                  <TableCell>{device.name}</TableCell>
                  <TableCell>{device.phone_number}</TableCell>
                  <TableCell>
                    <Chip 
                      label={device.last_known_status || 'Desconocido'} 
                      color={getStatusColor(device.last_known_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {device.last_location_lat && device.last_location_lon 
                      ? `Lat: ${device.last_location_lat.toFixed(4)}, Long: ${device.last_location_lon.toFixed(4)}`
                      : 'No disponible'
                    }
                  </TableCell>
                  <TableCell>
                    {device.active_qod_session_id ? (
                      <Chip 
                        label={device.active_qod_profile} 
                        color="primary"
                        size="small"
                      />
                    ) : 'Ninguna'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Consultar estado">
                      <IconButton 
                        size="small" 
                        onClick={() => getDeviceStatus(device.id)}
                      >
                        <WifiIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Consultar ubicación">
                      <IconButton 
                        size="small" 
                        onClick={() => getDeviceLocation(device.id)}
                      >
                        <LocationIcon />
                      </IconButton>
                    </Tooltip>
                    {device.active_qod_session_id ? (
                      <Button 
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => deleteQoDSession(device.id)}
                        style={{ marginLeft: '4px' }}
                      >
                        Terminar QoD
                      </Button>
                    ) : (
                      <Button 
                        variant="contained"
                        size="small"
                        onClick={() => showQoDModal(device.id)}
                        style={{ marginLeft: '4px' }}
                      >
                        Iniciar QoD
                      </Button>
                    )}
                    <Tooltip title="Editar dispositivo">
                      <IconButton 
                        size="small" 
                        onClick={() => showEditModal(device)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar dispositivo">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => confirmDeleteDevice(device)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {devices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay dispositivos registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de eliminar dispositivo */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este dispositivo? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteDevice} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Formulario de dispositivo */}
      <DeviceForm
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onSubmit={handleDeviceFormSubmit}
        initialValues={currentDevice}
        isEdit={isEditMode}
      />

      {/* Modal de QoD */}
      <QoDSessionModal
        visible={isQoDModalVisible}
        onCancel={handleQoDModalCancel}
        deviceId={selectedDeviceId}
        onSuccess={fetchDevices}
      />

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
    </div>
  );
};

export default DeviceList; 