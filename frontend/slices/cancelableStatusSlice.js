import { createSlice } from '@reduxjs/toolkit';

const cancelableStatusSlice = createSlice({
  name: 'cancelableStatus',
  initialState: {},
  reducers: {
    setCancelableStatus: (state, action) => {
      const { appointmentId, status } = action.payload; // payload tu action
      state[appointmentId] = status; // set status cua appointmentId, cancel = true hoac false
    },
  },
});

export const { setCancelableStatus } = cancelableStatusSlice.actions;

export default cancelableStatusSlice.reducer;