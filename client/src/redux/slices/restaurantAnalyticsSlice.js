import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to fetch restaurant analytics
export const fetchRestaurantAnalytics = createAsyncThunk(
  "restaurantAnalytics/fetch",
  async ({ token, restaurantId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/restaurant-analytics/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return rejectWithValue({ error: "Failed to fetch analytics" });
    }
  }
);

const restaurantAnalyticsSlice = createSlice({
  name: "restaurantAnalytics",
  initialState: {
    data: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearRestaurantAnalyticsState: (state) => {
      state.data = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantAnalytics.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRestaurantAnalytics.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchRestaurantAnalytics.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearRestaurantAnalyticsState } =
  restaurantAnalyticsSlice.actions;
export default restaurantAnalyticsSlice.reducer;
