import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  sessionToken: localStorage.getItem("session_token") || null, // Store session token
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    resetSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    resetFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signOutSuccess: (state) => {
      state.currentUser = null;
      state.sessionToken = null; // 🟢 Clear the token
      localStorage.removeItem("session_token"); // 🟢 Clear storage
    },
    clearError: (state) => {
      state.error = null; // Clear the error
    },
    setSessionToken: (state, action) => {
      // 🟢 New reducer to set the session token
      state.sessionToken = action.payload;
      localStorage.setItem("session_token", action.payload); // Store token in localStorage
    },
  },
});

export const {
  resetStart,
  resetSuccess,
  resetFailure,
  signInStart,
  signInSuccess,
  signInFailure,
  signOutSuccess,
  clearError,
  setSessionToken,
} = userSlice.actions;

export default userSlice.reducer;
