import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Box, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  InputAdornment,
  IconButton,
  Typography
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const { login, error, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario escribe
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'El correu electrònic és obligatori';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correu electrònic no és vàlid';
    }
    
    if (!formData.password) {
      errors.password = 'La contrasenya és obligatòria';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const userRole = await login(formData.email, formData.password);
      
      // Redireccionar según el rol del usuario
      if (userRole === 'emergency_center') {
        navigate('/dashboard');
      } else if (userRole === 'resource_personnel') {
        navigate('/resource');
      } else if (userRole === 'emergency_operator') {
        navigate('/operator');
      }
    } catch (err) {
      // El error ya se maneja en el contexto de autenticación
      console.error('Error de inicio de sesión:', err);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Iniciar Sessió
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Correu electrònic"
        name="email"
        autoComplete="email"
        autoFocus
        value={formData.email}
        onChange={handleChange}
        error={!!formErrors.email}
        helperText={formErrors.email}
        disabled={isLoading}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Contrasenya"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        value={formData.password}
        onChange={handleChange}
        error={!!formErrors.password}
        helperText={formErrors.password}
        disabled={isLoading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Iniciar Sessió'
        )}
      </Button>
    </Box>
  );
};

export default Login; 