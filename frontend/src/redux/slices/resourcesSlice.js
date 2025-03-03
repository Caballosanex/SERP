import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Thunks
export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/resources`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const assignResource = createAsyncThunk(
  'resources/assignResource',
  async ({ resourceId, emergencyId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/resources/${resourceId}/assign`, { emergencyId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const unassignResource = createAsyncThunk(
  'resources/unassignResource',
  async (resourceId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/resources/${resourceId}/unassign`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice inicial
const initialState = {
  resources: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  activeResource: null
};

// Slice
const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setActiveResource: (state, action) => {
      state.activeResource = action.payload;
    },
    clearActiveResource: (state) => {
      state.activeResource = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Obtener recursos
      .addCase(fetchResources.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.resources = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Asignar recurso
      .addCase(assignResource.fulfilled, (state, action) => {
        const index = state.resources.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.resources[index] = action.payload;
        }
        if (state.activeResource?.id === action.payload.id) {
          state.activeResource = action.payload;
        }
      })
      // Desasignar recurso
      .addCase(unassignResource.fulfilled, (state, action) => {
        const index = state.resources.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.resources[index] = action.payload;
        }
        if (state.activeResource?.id === action.payload.id) {
          state.activeResource = action.payload;
        }
      });
  }
});

export const { setActiveResource, clearActiveResource } = resourcesSlice.actions;

export default resourcesSlice.reducer; 