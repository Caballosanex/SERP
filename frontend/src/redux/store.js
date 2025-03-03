import { configureStore } from '@reduxjs/toolkit';
import emergenciesReducer from './slices/emergenciesSlice';
import resourcesReducer from './slices/resourcesSlice';
import alertsReducer from './slices/alertsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    emergencies: emergenciesReducer,
    resources: resourcesReducer,
    alerts: alertsReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
}); 