import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Thunks
export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/qosod/alerts`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resolveAlert = createAsyncThunk(
  'alerts/resolveAlert',
  async (alertId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/qosod/alerts/${alertId}/resolve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice inicial
const initialState = {
  alerts: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

// Slice
const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Obtener alertas
      .addCase(fetchAlerts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.alerts = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Resolver alerta
      .addCase(resolveAlert.fulfilled, (state, action) => {
        const index = state.alerts.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
        }
      });
  }
});

export default alertsSlice.reducer; 