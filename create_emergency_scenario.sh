#!/bin/bash

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
API_URL="http://localhost:5001"
NOKIA_API_URL="http://mock-nokia-api:6000"
DEBUG_MODE=false
DELAY=1  # Default delay reducido

# Función de ayuda
show_help() {
    echo -e "${BLUE}Usage: $0 [OPTIONS]${NC}"
    echo -e "\nOpciones:"
    echo -e "  ${GREEN}-d${NC}         Modo debug (más información y delay de 5s)"
    echo -e "  ${GREEN}-h, --help${NC} Muestra esta ayuda"
    echo -e "\nEjemplos:"
    echo -e "  $0          # Ejecución rápida"
    echo -e "  $0 -d       # Modo debug con más información"
    exit 0
}

# Procesar argumentos
while getopts "dh-:" opt; do
    case $opt in
        d) DEBUG_MODE=true
           DELAY=5
           ;;
        h) show_help ;;
        -) case "${OPTARG}" in
               help) show_help ;;
               *) echo -e "${RED}Opción inválida: --${OPTARG}${NC}" >&2
                  exit 1 ;;
           esac ;;
        ?) echo -e "${RED}Opción inválida: -${OPTARG}${NC}" >&2
           exit 1 ;;
    esac
done

# Función de log para debug
log_debug() {
    if [ "$DEBUG_MODE" = true ]; then
        echo -e "${BLUE}[DEBUG] $1${NC}"
    fi
}

# Función de log para éxito
log_success() {
    echo -e "${GREEN}[✓] $1${NC}"
}

# Función de log para error
log_error() {
    echo -e "${RED}[✗] $1${NC}"
}

# Función de log para información
log_info() {
    echo -e "${YELLOW}[i] $1${NC}"
}

log_debug "Iniciando script en modo debug (delay: ${DELAY}s)\n"
log_info "Limpiando dispositivos existentes...\n"

# Eliminar dispositivos específicos si existen
DEVICE_IDS=("ambulance-001" "fire-001" "police-001")
for device_id in "${DEVICE_IDS[@]}"; do
    if curl -s -X GET "${API_URL}/api/devices" | grep -q "\"id\":\"$device_id\""; then
        log_debug "Eliminando dispositivo: $device_id"
        DELETE_RESPONSE=$(curl -s -X DELETE "${API_URL}/api/devices/${device_id}")
        if [ $? -eq 0 ]; then
            log_success "Dispositivo $device_id eliminado"
        else
            log_error "Error al eliminar dispositivo $device_id: $DELETE_RESPONSE"
        fi
        sleep $DELAY
    fi
done

echo -e "\n"
log_info "Creando dispositivos de emergencia...\n"

# Función para comprobar si un dispositivo existe
check_device() {
    local device_id=$1
    local response=$(curl -s -X GET "${API_URL}/api/devices")
    if echo "$response" | grep -q "\"id\":\"$device_id\""; then
        return 0 # existe
    else
        return 1 # no existe
    fi
}

# Crear ambulancia
if ! check_device "ambulance-001"; then
    AMBULANCE_RESPONSE=$(curl -s -X POST "${API_URL}/api/devices?device_id=ambulance-001" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "ambulance",
        "location": {
            "latitude": 41.3851,
            "longitude": 2.1734,
            "accuracy": 10.0,
            "speed": 0,
            "heading": 0,
            "timestamp": null
        }
      }')
    if echo "$AMBULANCE_RESPONSE" | grep -q "error\|Bad Request"; then
        echo "Error al crear ambulancia: $AMBULANCE_RESPONSE"
    else
        echo "Ambulancia creada: $AMBULANCE_RESPONSE"
    fi
else
    echo "Ambulancia 'ambulance-001' ya existe"
    # Actualizar ubicación de la ambulancia existente
    curl -s -X POST "${NOKIA_API_URL}/api/v1/mock/location?device_id=ambulance-001&latitude=41.3851&longitude=2.1734"
fi
sleep $DELAY

# Crear camión de bomberos
if ! check_device "fire-001"; then
    FIRE_TRUCK_RESPONSE=$(curl -s -X POST "${API_URL}/api/devices?device_id=fire-001" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "fire_truck",
        "location": {
            "latitude": 41.3852,
            "longitude": 2.1735,
            "accuracy": 10.0,
            "speed": 0,
            "heading": 0,
            "timestamp": null
        }
      }')
    if echo "$FIRE_TRUCK_RESPONSE" | grep -q "error\|Bad Request"; then
        echo "Error al crear camión de bomberos: $FIRE_TRUCK_RESPONSE"
    else
        echo "Camión de bomberos creado: $FIRE_TRUCK_RESPONSE"
    fi
else
    echo "Camión de bomberos 'fire-001' ya existe"
    # Actualizar ubicación del camión de bomberos existente
    curl -s -X POST "${NOKIA_API_URL}/api/v1/mock/location?device_id=fire-001&latitude=41.3852&longitude=2.1735"
fi
sleep $DELAY

# Crear coche de policía
if ! check_device "police-001"; then
    POLICE_CAR_RESPONSE=$(curl -s -X POST "${API_URL}/api/devices?device_id=police-001" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "police_car",
        "location": {
            "latitude": 41.3853,
            "longitude": 2.1736,
            "accuracy": 10.0,
            "speed": 0,
            "heading": 0,
            "timestamp": null
        }
      }')
    if echo "$POLICE_CAR_RESPONSE" | grep -q "error\|Bad Request"; then
        echo "Error al crear coche de policía: $POLICE_CAR_RESPONSE"
    else
        echo "Coche de policía creado: $POLICE_CAR_RESPONSE"
    fi
else
    echo "Coche de policía 'police-001' ya existe"
    # Actualizar ubicación del coche de policía existente
    curl -s -X POST "${NOKIA_API_URL}/api/v1/mock/location?device_id=police-001&latitude=41.3853&longitude=2.1736"
fi
sleep $DELAY

echo -e "\nCreando múltiples emergencias para probar QoS..."

# Crear primera emergencia médica
log_info "Creando primera emergencia médica..."
MEDICAL_ALERT_1_RESPONSE=$(curl -s -X POST "${API_URL}/api/alerts" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "medical",
    "location": "Hospital Central",
    "description": "Emergencia médica urgente #1",
    "priority": 1
  }')
if [ $? -eq 0 ]; then
    log_success "Primera emergencia médica creada"
    [ "$DEBUG_MODE" = true ] && echo -e "Respuesta: $MEDICAL_ALERT_1_RESPONSE\n"
else
    log_error "Error al crear primera emergencia médica: $MEDICAL_ALERT_1_RESPONSE"
fi
sleep $DELAY

# Crear segunda emergencia médica
log_info "Creando segunda emergencia médica..."
MEDICAL_ALERT_2_RESPONSE=$(curl -s -X POST "${API_URL}/api/alerts" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "medical",
    "location": "Centro Comercial",
    "description": "Emergencia médica urgente #2",
    "priority": 1
  }')
if [ $? -eq 0 ]; then
    log_success "Segunda emergencia médica creada"
    [ "$DEBUG_MODE" = true ] && echo -e "Respuesta: $MEDICAL_ALERT_2_RESPONSE\n"
else
    log_error "Error al crear segunda emergencia médica: $MEDICAL_ALERT_2_RESPONSE"
fi
sleep $DELAY

log_info "\nVerificando estado de QoS para ambulancia..."
curl -s -X GET "${API_URL}/api/devices/ambulance-001" | json_pp
sleep $DELAY

# Finalizar primera emergencia
MEDICAL_ALERT_1_ID=$(echo $MEDICAL_ALERT_1_RESPONSE | jq -r '.id')
log_info "\nFinalizando primera emergencia médica..."
RESOLVE_RESPONSE=$(curl -s -X PATCH "${API_URL}/api/alerts/${MEDICAL_ALERT_1_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "resolution_notes": "Primera emergencia atendida"
  }')
if [ $? -eq 0 ]; then
    log_success "Primera emergencia médica finalizada"
else
    log_error "Error al finalizar primera emergencia médica: $RESOLVE_RESPONSE"
fi
sleep $DELAY

log_info "\nVerificando que QoS sigue activo para ambulancia (segunda emergencia pendiente)..."
curl -s -X GET "${API_URL}/api/devices/ambulance-001" | json_pp
sleep $DELAY

# Finalizar segunda emergencia
MEDICAL_ALERT_2_ID=$(echo $MEDICAL_ALERT_2_RESPONSE | jq -r '.id')
log_info "\nFinalizando segunda emergencia médica..."
RESOLVE_RESPONSE=$(curl -s -X PATCH "${API_URL}/api/alerts/${MEDICAL_ALERT_2_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "resolution_notes": "Segunda emergencia atendida"
  }')
if [ $? -eq 0 ]; then
    log_success "Segunda emergencia médica finalizada"
else
    log_error "Error al finalizar segunda emergencia médica: $RESOLVE_RESPONSE"
fi
sleep $DELAY

log_info "\nVerificando que QoS se ha desactivado (no hay más emergencias)..."
curl -s -X GET "${API_URL}/api/devices/ambulance-001" | json_pp
sleep $DELAY

echo -e "\nListando todas las emergencias..."
curl -s -X GET "${API_URL}/api/alerts" | json_pp
sleep $DELAY

echo -e "\nListando todos los dispositivos..."
curl -s -X GET "${API_URL}/api/devices" | json_pp
sleep $DELAY

# Finalizar emergencias
log_info "\nFinalizando emergencias activas...\n"
ACTIVE_ALERTS=$(curl -s -X GET "${API_URL}/api/alerts" | jq -r '.[] | select(.status=="active") | .id')

for ALERT_ID in $ACTIVE_ALERTS; do
    log_info "Finalizando alerta: $ALERT_ID"
    RESOLVE_RESPONSE=$(curl -s -X PATCH "${API_URL}/api/alerts/${ALERT_ID}" \
      -H "Content-Type: application/json" \
      -d '{
        "status": "resolved",
        "resolution_notes": "Emergencia atendida y resuelta"
      }')
    if [ $? -eq 0 ]; then
        log_success "Alerta $ALERT_ID finalizada"
    else
        log_error "Error al finalizar alerta $ALERT_ID: $RESOLVE_RESPONSE"
    fi
    sleep $DELAY
done

echo -e "\nEstado final de las emergencias:"
curl -s -X GET "${API_URL}/api/alerts" | json_pp

# Eliminar todos los dispositivos al final
echo -e "\nEliminando todos los dispositivos..."
for device_id in "${DEVICE_IDS[@]}"; do
    echo "Eliminando dispositivo: $device_id"
    DELETE_RESPONSE=$(curl -s -X DELETE "${API_URL}/api/devices/${device_id}")
    if [ $? -eq 0 ]; then
        echo "Dispositivo $device_id eliminado correctamente"
    else
        echo "Error al eliminar dispositivo $device_id: $DELETE_RESPONSE"
    fi
    sleep $DELAY
done

echo -e "\nVerificando que no quedan dispositivos:"
curl -s -X GET "${API_URL}/api/devices" | json_pp

if [ "$DEBUG_MODE" = true ]; then
    echo -e "\n"
    log_info "Estado final del sistema:"
    echo -e "\nEmergencias actuales:"
    curl -s -X GET "${API_URL}/api/alerts" | json_pp
    echo -e "\nDispositivos activos:"
    curl -s -X GET "${API_URL}/api/devices" | json_pp
fi

# Añadir al final del script
log_info "\nProbando asignaciones de dispositivos a emergencias..."

# Verificar asignaciones para ambulancia
log_info "Verificando asignaciones para ambulance-001..."
AMBULANCE_ASSIGNMENTS=$(curl -s -X GET "${API_URL}/api/devices/ambulance-001/assignments")
echo $AMBULANCE_ASSIGNMENTS | json_pp

# Verificar asignaciones para bomberos
log_info "Verificando asignaciones para fire-001..."
FIRE_ASSIGNMENTS=$(curl -s -X GET "${API_URL}/api/devices/fire-001/assignments")
echo $FIRE_ASSIGNMENTS | json_pp

# Verificar asignaciones para policía
log_info "Verificando asignaciones para police-001..."
POLICE_ASSIGNMENTS=$(curl -s -X GET "${API_URL}/api/devices/police-001/assignments")
echo $POLICE_ASSIGNMENTS | json_pp

log_info "\nPuedes acceder al panel de emergencias en http://localhost:3001"
log_info "Usa los IDs: ambulance-001, fire-001 o police-001 para iniciar sesión"

log_success "Script completado\n"