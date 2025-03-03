import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Thunks
export const fetchEmergencies = createAsyncThunk(
  'emergencies/fetchEmergencies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/emergencies`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createEmergency = createAsyncThunk(
  'emergencies/createEmergency',
  async (emergencyData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/emergencies`, emergencyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateEmergency = createAsyncThunk(
  'emergencies/updateEmergency',
  async ({ id, emergencyData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/emergencies/${id}`, emergencyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteEmergency = createAsyncThunk(
  'emergencies/deleteEmergency',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/emergencies/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resolveEmergency = createAsyncThunk(
  'emergencies/resolveEmergency',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/emergencies/${id}/resolve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const assignResourcesToEmergency = createAsyncThunk(
  'emergencies/assignResourcesToEmergency',
  async ({ emergencyId, resourceIds }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/emergencies/${emergencyId}/assign-resources`, { resourceIds });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice inicial
const initialState = {
  emergencies: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  activeEmergency: null
};

// Slice
const emergenciesSlice = createSlice({
  name: 'emergencies',
  initialState,
  reducers: {
    setActiveEmergency: (state, action) => {
      state.activeEmergency = action.payload;
    },
    clearActiveEmergency: (state) => {
      state.activeEmergency = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Obtener emergencias
      .addCase(fetchEmergencies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmergencies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.emergencies = action.payload;
      })
      .addCase(fetchEmergencies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Crear emergencia
      .addCase(createEmergency.fulfilled, (state, action) => {
        state.emergencies.push(action.payload);
      })
      // Actualizar emergencia
      .addCase(updateEmergency.fulfilled, (state, action) => {
        const index = state.emergencies.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.emergencies[index] = action.payload;
        }
        if (state.activeEmergency?.id === action.payload.id) {
          state.activeEmergency = action.payload;
        }
      })
      // Eliminar emergencia
      .addCase(deleteEmergency.fulfilled, (state, action) => {
        state.emergencies = state.emergencies.filter(e => e.id !== action.payload);
        if (state.activeEmergency?.id === action.payload) {
          state.activeEmergency = null;
        }
      })
      // Resolver emergencia
      .addCase(resolveEmergency.fulfilled, (state, action) => {
        const index = state.emergencies.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.emergencies[index] = action.payload;
        }
        if (state.activeEmergency?.id === action.payload.id) {
          state.activeEmergency = action.payload;
        }
      })
      // Asignar recursos a emergencia
      .addCase(assignResourcesToEmergency.fulfilled, (state, action) => {
        const index = state.emergencies.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.emergencies[index] = action.payload;
        }
        if (state.activeEmergency?.id === action.payload.id) {
          state.activeEmergency = action.payload;
        }
      });
  }
});

export const { setActiveEmergency, clearActiveEmergency } = emergenciesSlice.actions;

export default emergenciesSlice.reducer; 