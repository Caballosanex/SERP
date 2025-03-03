import React, { useState, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Spin, Button, Tag, Tooltip, Badge } from 'antd';
import { WifiOutlined, DashboardOutlined } from '@ant-design/icons';
import L from 'leaflet';
import axios from 'axios';
import QoDSessionModal from './QoDSessionModal';

// Ícono personalizado para dispositivos con Nokia NAC
const createDeviceIcon = (status) => {
  let color = '#999'; // Gris por defecto (estado desconocido)
  
  if (status === 'online') {
    color = '#52c41a'; // Verde
  } else if (status === 'offline') {
    color = '#f5222d'; // Rojo
  }
  
  return L.divIcon({
    className: 'custom-device-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const DeviceMapLayer = ({ map }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isQoDModalVisible, setIsQoDModalVisible] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  // Cargar dispositivos
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/devices`);
      // Filtrar solo los dispositivos que tienen ubicación
      const devicesWithLocation = response.data.filter(
        device => device.last_location_lat && device.last_location_lon
      );
      setDevices(devicesWithLocation);
    } catch (error) {
      console.error('Error al cargar los dispositivos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchDevices();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Gestión del modal QoD
  const showQoDModal = (deviceId) => {
    setSelectedDeviceId(deviceId);
    setIsQoDModalVisible(true);
  };

  const handleQoDModalCancel = () => {
    setIsQoDModalVisible(false);
    setSelectedDeviceId(null);
  };

  // Terminar sesión QoD
  const deleteQoDSession = async (deviceId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/devices/${deviceId}/qod`);
      fetchDevices();
    } catch (error) {
      console.error('Error al eliminar la sesión QoD:', error);
    }
  };

  return (
    <>
      {loading && <Spin spinning={loading} style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 1000 }} />}
      
      {devices.map(device => (
        <Marker
          key={device.id}
          position={[device.last_location_lat, device.last_location_lon]}
          icon={createDeviceIcon(device.last_known_status)}
        >
          <Popup>
            <div style={{ minWidth: '200px' }}>
              <h3>{device.name}</h3>
              <p><strong>Teléfono:</strong> {device.phone_number}</p>
              
              <p>
                <strong>Estado:</strong>{' '}
                <Tag color={device.last_known_status === 'online' ? 'green' : device.last_known_status === 'offline' ? 'red' : 'default'}>
                  {device.last_known_status || 'Desconocido'}
                </Tag>
              </p>
              
              <p>
                <strong>QoD:</strong>{' '}
                {device.active_qod_session_id ? (
                  <Tooltip title={`ID: ${device.active_qod_session_id}`}>
                    <Tag color="blue">{device.active_qod_profile || 'Activo'}</Tag>
                  </Tooltip>
                ) : (
                  <Tag color="default">Ninguna</Tag>
                )}
              </p>
              
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                {device.active_qod_session_id ? (
                  <Button 
                    danger
                    size="small"
                    icon={<DashboardOutlined />}
                    onClick={() => deleteQoDSession(device.id)}
                  >
                    Terminar QoD
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    size="small"
                    icon={<DashboardOutlined />}
                    onClick={() => showQoDModal(device.id)}
                  >
                    Iniciar QoD
                  </Button>
                )}
                
                <Button 
                  size="small"
                  icon={<WifiOutlined />}
                  onClick={async () => {
                    try {
                      await axios.get(`${process.env.REACT_APP_API_URL}/devices/${device.id}/status`);
                      fetchDevices();
                    } catch (error) {
                      console.error('Error al actualizar estado:', error);
                    }
                  }}
                >
                  Actualizar estado
                </Button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Modal para gestionar sesiones QoD */}
      <QoDSessionModal 
        visible={isQoDModalVisible}
        onCancel={handleQoDModalCancel}
        deviceId={selectedDeviceId}
        onSuccess={fetchDevices}
      />
    </>
  );
};

export default DeviceMapLayer; 