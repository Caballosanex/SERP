import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

const GestioUsuaris = () => {
  const [users, setUsers] = React.useState([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [userToDelete, setUserToDelete] = React.useState(null);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    role: '',
    status: 'active'
  });

  // Cargar usuarios desde localStorage al iniciar
  React.useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      status: 'active'
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSaveUser = () => {
    const newUsers = [...users];
    
    if (selectedUser) {
      // Editar usuario existente
      const index = newUsers.findIndex(u => u.id === selectedUser.id);
      newUsers[index] = { ...formData, id: selectedUser.id };
    } else {
      // Añadir nuevo usuario
      const newUser = {
        ...formData,
        id: Date.now(), // Generar ID único
      };
      newUsers.push(newUser);
    }

    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
    handleCloseDialog();
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    const newUsers = users.filter(user => user.id !== userToDelete.id);
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'emergency_operator':
        return 'Operador d\'Emergències';
      case 'resource_personnel':
        return 'Personal de Recursos';
      case 'emergency_center':
        return 'Centre d\'Emergències';
      default:
        return role;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gestió d'Usuaris
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedUser(null);
            setOpenDialog(true);
          }}
        >
          Nou Usuari
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Correu Electrònic</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estat</TableCell>
              <TableCell align="right">Accions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getRoleLabel(user.role)}</TableCell>
                <TableCell>
                  <Chip
                    label={user.status === 'active' ? 'Actiu' : 'Inactiu'}
                    color={user.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleEditClick(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteClick(user)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Editar Usuari' : 'Nou Usuari'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Correu Electrònic"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={formData.role}
                    label="Rol"
                    name="role"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="emergency_operator">Operador d'Emergències</MenuItem>
                    <MenuItem value="resource_personnel">Personal de Recursos</MenuItem>
                    <MenuItem value="emergency_center">Centre d'Emergències</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Estat</InputLabel>
                  <Select
                    value={formData.status}
                    label="Estat"
                    name="status"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="active">Actiu</MenuItem>
                    <MenuItem value="inactive">Inactiu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel·lar</Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained"
            disabled={!formData.name || !formData.email || !formData.role}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>
          Confirmar Eliminació
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Estàs segur que vols eliminar l'usuari {userToDelete?.name}? Aquesta acció no es pot desfer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel·lar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestioUsuaris; 