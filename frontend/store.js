import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './slices/loginSlice';
import { courtsApi } from './services/courtsApi';
import cancelableStatusReducer from './slices/cancelableStatusSlice';

export const store = configureStore({
  reducer: {
    login: loginReducer,
    [courtsApi.reducerPath]: courtsApi.reducer,
    cancelableStatus: cancelableStatusReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(courtsApi.middleware),
});