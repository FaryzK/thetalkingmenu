// platformControlPanelRestaurantsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch all restaurants (admin only)
export const fetchAllRestaurants = createAsyncThunk(
  "platformControlPanelRestaurants/fetchAllRestaurants",
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/restaurants", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data; // List of all restaurants
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a restaurant by ID (admin only)
export const deleteRestaurant = createAsyncThunk(
  "platformControlPanelRestaurants/deleteRestaurant",
  async ({ token, restaurantId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data);
      }
      return restaurantId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const platformControlPanelRestaurantsSlice = createSlice({
  name: "platformControlPanelRestaurants",
  initialState: {
    allRestaurants: [], // List of all restaurants for admin
    status: "idle", // Fetching status for admin operations
    error: null,
  },
  reducers: {
    clearPlatformControlPanelState: (state) => {
      state.allRestaurants = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRestaurants.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllRestaurants.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allRestaurants = action.payload;
      })
      .addCase(fetchAllRestaurants.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch restaurants";
      })
      .addCase(deleteRestaurant.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allRestaurants = state.allRestaurants.filter(
          (restaurant) => restaurant._id !== action.payload
        );
      })
      .addCase(deleteRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to delete restaurant";
      });
  },
});

export const { clearPlatformControlPanelState } =
  platformControlPanelRestaurantsSlice.actions;
export default platformControlPanelRestaurantsSlice.reducer;
