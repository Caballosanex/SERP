"""
Servicio para gestionar asignaciones de dispositivos a emergencias
"""

class EmergencyAssignments:
    def __init__(self):
        self.device_to_alerts = {}  # {device_id: [alert_id1, alert_id2, ...]}
        self.alert_to_devices = {}  # {alert_id: [device_id1, device_id2, ...]}
    
    def assign_device(self, alert_id: str, device_id: str):
        """Asigna un dispositivo a una alerta"""
        # Actualizar mapping de alerta a dispositivos
        if alert_id not in self.alert_to_devices:
            self.alert_to_devices[alert_id] = []
        if device_id not in self.alert_to_devices[alert_id]:
            self.alert_to_devices[alert_id].append(device_id)
        
        # Actualizar mapping de dispositivo a alertas
        if device_id not in self.device_to_alerts:
            self.device_to_alerts[device_id] = []
        if alert_id not in self.device_to_alerts[device_id]:
            self.device_to_alerts[device_id].append(alert_id)
    
    def unassign_device(self, alert_id: str, device_id: str):
        """Desasigna un dispositivo de una alerta"""
        # Remover de alerta a dispositivos
        if alert_id in self.alert_to_devices and device_id in self.alert_to_devices[alert_id]:
            self.alert_to_devices[alert_id].remove(device_id)
        
        # Remover de dispositivo a alertas
        if device_id in self.device_to_alerts and alert_id in self.device_to_alerts[device_id]:
            self.device_to_alerts[device_id].remove(alert_id)
    
    def get_alert_devices(self, alert_id: str) -> list:
        """Obtiene todos los dispositivos asignados a una alerta"""
        return self.alert_to_devices.get(alert_id, [])
    
    def get_device_alerts(self, device_id: str) -> list:
        """Obtiene todas las alertas asignadas a un dispositivo"""
        return self.device_to_alerts.get(device_id, [])

# Singleton instance
emergency_assignments = EmergencyAssignments() 