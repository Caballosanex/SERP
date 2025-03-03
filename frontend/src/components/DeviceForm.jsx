import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Switch, 
  FormControlLabel, 
  Button,
  Box
} from '@mui/material';

const DeviceForm = ({ visible, onCancel, onSubmit, initialValues, isEdit }) => {
  const [formValues, setFormValues] = useState({
    name: '',
    phone_number: '',
    description: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        setFormValues({
          name: initialValues.name || '',
          phone_number: initialValues.phone_number || '',
          description: initialValues.description || '',
          is_active: initialValues.is_active !== undefined ? initialValues.is_active : true
        });
      } else {
        // Reset form to default values
        setFormValues({
          name: '',
          phone_number: '',
          description: '',
          is_active: true
        });
      }
      setErrors({});
    }
  }, [visible, initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleSwitchChange = (e) => {
    setFormValues({
      ...formValues,
      is_active: e.target.checked
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formValues.name.trim()) {
      newErrors.name = 'Por favor, introduce un nombre para el dispositivo';
    }
    
    if (!formValues.phone_number.trim()) {
      newErrors.phone_number = 'Por favor, introduce el número de teléfono';
    } else if (!/^\+[0-9]+$/.test(formValues.phone_number)) {
      newErrors.phone_number = 'El número debe comenzar con + seguido de dígitos (formato E.164)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formValues);
    }
  };

  return (
    <Dialog 
      open={visible} 
      onClose={onCancel}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isEdit ? 'Editar dispositivo' : 'Añadir nuevo dispositivo'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Nombre"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Número de teléfono"
            name="phone_number"
            value={formValues.phone_number}
            onChange={handleChange}
            error={!!errors.phone_number}
            helperText={errors.phone_number}
            placeholder="+346XXXXXXXX"
            required
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Descripción"
            name="description"
            value={formValues.description}
            onChange={handleChange}
            multiline
            rows={4}
          />
          
          <FormControlLabel
            control={
              <Switch 
                checked={formValues.is_active}
                onChange={handleSwitchChange}
                color="primary"
              />
            }
            label="Activo"
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceForm; 