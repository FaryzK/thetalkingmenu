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

// Transfer restaurant ownership (admin only)
export const transferRestaurantOwnership = createAsyncThunk(
  "platformControlPanelRestaurants/transferRestaurantOwnership",
  async ({ token, restaurantId, newOwnerEmail }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/restaurant/${restaurantId}/transfer`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newOwnerEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to transfer ownership");
      }

      // Include newOwnerEmail in the returned payload
      return { ...data, newOwnerEmail };
    } catch (error) {
      return rejectWithValue(error.message || "Network error occurred");
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
      })
      .addCase(transferRestaurantOwnership.pending, (state) => {
        state.status = "loading";
      })
      .addCase(transferRestaurantOwnership.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Find and update the restaurant's ownerEmail
        const index = state.allRestaurants.findIndex(
          (restaurant) => restaurant._id === action.payload.restaurant._id
        );
        if (index !== -1) {
          state.allRestaurants[index].ownerEmail = action.payload.newOwnerEmail;
        }
      })
      .addCase(transferRestaurantOwnership.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to transfer ownership";
      });
  },
});

export const { clearPlatformControlPanelState } =
  platformControlPanelRestaurantsSlice.actions;
export default platformControlPanelRestaurantsSlice.reducer;
