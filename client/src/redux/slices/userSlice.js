import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
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
      state.error = null;
      state.loading = false;
    },
    updateAccessibleDashboards: (state, action) => {
      if (state.currentUser) {
        state.currentUser.accessibleDashboards = action.payload;
      }
    },
    updateAccessibleRestaurants: (state, action) => {
      // New action for restaurants
      if (state.currentUser) {
        state.currentUser.accessibleRestaurants = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null; // Clear the error
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
  updateAccessibleDashboards,
  updateAccessibleRestaurants,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;
