import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const login = createAsyncThunk('login/login', async (credentials) => {
  const response = await axios.post('http://10.102.68.90:3000/login', credentials); //https://fun-adversely-arachnid.ngrok-free.app/login
  return response.data;
});

const loginSlice = createSlice({
  name: 'login',
  initialState: {
    user: null,
    token: null,
    role: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.role;
        console.log('role:', state.role);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { logout } = loginSlice.actions;

export default loginSlice.reducer;