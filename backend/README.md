# 🔧 Backend - Sistema d'Emergencies i Resposta Prioritaria
API central que gestiona la lógica de negocio y conecta con las APIs simuladas de Nokia.

## 🛠️ Tecnologías
- FastAPI
- Python 3.9
- Docker

## 📡 Endpoints

### Alertas
- `POST /api/alerts` → Crear alerta
- `GET /api/alerts` → Listar alertas
- `GET /api/alerts/{id}` → Detalles de alerta
- `PATCH /api/alerts/{id}` → Actualizar estado

### Dispositivos
- `GET /api/devices` → Listar dispositivos
- `POST /api/devices` → Crear dispositivo
- `GET /api/devices/{id}` → Detalles de dispositivo
- `PATCH /api/devices/{id}` → Actualizar dispositivo
- `DELETE /api/devices/{id}` → Eliminar dispositivo

### QoS
- `POST /api/devices/{id}/qos` → Activar QoS
- `DELETE /api/devices/{id}/qos` → Desactivar QoS

### Location
- `GET /api/devices/{id}/location` → Obtener ubicación

## 🔌 Integración con Nokia API
- QoS Management: `http://mock-nokia-api:6000/api/v1/qos`
- Location Services: `http://mock-nokia-api:6000/api/v1/location`

## 📝 Notas
- La API se integra con el mock de Nokia para QoS y ubicación
- Gestión automática de QoS al crear/resolver alertas
- Soporte para asignación de dispositivos a emergencias
- CORS habilitado para el frontend