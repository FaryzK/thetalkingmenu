// platformControlPanelRestaurantsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const createRestaurant = createAsyncThunk(
  "platformControlPanelRestaurants/createRestaurant",
  async ({ token, restaurantData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/restaurants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(restaurantData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to create restaurant");
      }

      return data.restaurant; // Return the new restaurant data
    } catch (error) {
      return rejectWithValue(error.message || "Network error occurred");
    }
  }
);

// Fetch restaurants with pagination and search
export const fetchAllRestaurants = createAsyncThunk(
  "platformControlPanelRestaurants/fetchAllRestaurants",
  async ({ token, page = 1, limit = 20, search = "" }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/restaurants?page=${page}&limit=${limit}&search=${search}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data; // Paginated response
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
    allRestaurants: [],
    totalRestaurants: 0,
    currentPage: 1,
    totalPages: 1,
    status: "idle",
    error: null,
  },
  reducers: {
    clearRestaurantState: (state) => {
      state.allRestaurants = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRestaurant.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allRestaurants.unshift(action.payload); // Add the new restaurant at the top of the list
        state.totalRestaurants += 1; // Increase the total number of restaurants
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchAllRestaurants.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllRestaurants.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allRestaurants = action.payload.restaurants;
        state.totalRestaurants = action.payload.totalRestaurants;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAllRestaurants.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
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
        state.error = action.payload;
      })
      .addCase(transferRestaurantOwnership.pending, (state) => {
        state.status = "loading";
      })
      .addCase(transferRestaurantOwnership.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.allRestaurants.findIndex(
          (restaurant) => restaurant._id === action.payload.restaurant._id
        );
        if (index !== -1) {
          state.allRestaurants[index].ownerEmail = action.payload.newOwnerEmail;
        }
      })
      .addCase(transferRestaurantOwnership.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearRestaurantState } =
  platformControlPanelRestaurantsSlice.actions;
export default platformControlPanelRestaurantsSlice.reducer;
