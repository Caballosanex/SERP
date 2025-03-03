import { createSlice } from '@reduxjs/toolkit';

// Slice inicial
const initialState = {
  sidebarOpen: true,
  notifications: [],
  currentView: 'map', // 'map' | 'list' | 'grid'
  filters: {
    emergencyType: 'all',
    status: 'all',
    priority: 'all'
  },
  mapSettings: {
    center: [41.3851, 2.1734], // Barcelona por defecto
    zoom: 13
  }
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
        read: false,
        timestamp: new Date().toISOString()
      });
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    setFilter: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setMapCenter: (state, action) => {
      state.mapSettings.center = action.payload;
    },
    setMapZoom: (state, action) => {
      state.mapSettings.zoom = action.payload;
    }
  }
});

export const {
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  markNotificationAsRead,
  clearNotifications,
  setCurrentView,
  setFilter,
  resetFilters,
  setMapCenter,
  setMapZoom
} = uiSlice.actions;

export default uiSlice.reducer; 