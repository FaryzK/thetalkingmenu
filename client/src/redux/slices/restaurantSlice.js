// restaurantSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addRestaurantToDashboard } from "./dashboardsSlice"; // Action to update dashboards
import { setAccessibleRestaurants } from "./userAccessSlice";

// Thunk to fetch restaurant details by ID
export const fetchRestaurant = createAsyncThunk(
  "restaurant/fetchRestaurant",
  async ({ token, restaurantId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/restaurant/${restaurantId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data; // Return the restaurant object
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to create a new restaurant
export const createRestaurant = createAsyncThunk(
  "restaurant/createRestaurant",
  async (
    { token, dashboardId, restaurantData },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await fetch(
        `/api/dashboards/${dashboardId}/restaurants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(restaurantData),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      // Dispatch an action to add the new restaurant to the dashboard in dashboardsSlice
      dispatch(
        addRestaurantToDashboard({ dashboardId, restaurant: data.restaurant })
      );

      // Dispatch to update accessibleRestaurants in userAccessSlice
      dispatch(setAccessibleRestaurants(data.accessibleRestaurants));

      return data.restaurant; // Return the new restaurant data
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to update restaurant information
export const updateRestaurantInfo = createAsyncThunk(
  "restaurant/updateRestaurantInfo",
  async ({ token, restaurantId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/restaurant/${restaurantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to update restaurant info"
        );
      }

      return data.restaurant; // Return the updated restaurant data
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState: {
    data: null, // Current restaurant data
    status: "idle", // Status of current restaurant fetch or creation
    error: null, // Error message, if any
  },
  reducers: {
    clearRestaurantState: (state) => {
      state.data = null;
      state.status = "idle";
      state.error = null;
    },
    removeEmployeeFromRestaurant: (state, action) => {
      const { restaurantId, userId } = action.payload;
      if (state.data && state.data._id === restaurantId) {
        state.data.userAccess = state.data.userAccess.filter(
          (emp) => emp.userId !== userId
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handling fetchRestaurant
      .addCase(fetchRestaurant.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch restaurant";
      })

      // Handling createRestaurant
      .addCase(createRestaurant.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload; // Optionally store created restaurant in data
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to create restaurant";
      })

      // Handling updateRestaurantInfo
      .addCase(updateRestaurantInfo.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateRestaurantInfo.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = { ...state.data, ...action.payload }; // Update the restaurant data with the payload
      })
      .addCase(updateRestaurantInfo.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update restaurant";
      });
  },
});

export const { clearRestaurantState, removeEmployeeFromRestaurant } =
  restaurantSlice.actions;

export default restaurantSlice.reducer;
