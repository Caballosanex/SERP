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
  IconButton
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
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Validar el campo cuando cambia
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    let error = '';
    
    if (touched[fieldName] && !value) {
      error = 'Aquest camp és obligatori';
    } else if (fieldName === 'email' && touched.email) {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(value)) {
        error = 'El correu electrònic no és vàlid';
      }
    }
    
    setFormErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };
  
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, formData[name]);
  };
  
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    setTouched({
      email: true,
      password: true
    });
    
    // Validar todos los campos
    validateField('email', formData.email);
    validateField('password', formData.password);
    
    // Verificar si hay errores
    if (!formData.email || !formData.password) {
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
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        fullWidth
        id="email"
        label="Correu electrònic"
        name="email"
        autoComplete="email"
        autoFocus
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!formErrors.email}
        helperText={formErrors.email}
        disabled={isLoading}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: formErrors.email ? 'error.main' : 'inherit',
            },
          },
        }}
      />
      
      <TextField
        margin="normal"
        fullWidth
        name="password"
        label="Contrasenya"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!formErrors.password}
        helperText={formErrors.password}
        disabled={isLoading}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: formErrors.password ? 'error.main' : 'inherit',
            },
          },
        }}
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
        disabled={isLoading || !!formErrors.email || !!formErrors.password}
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