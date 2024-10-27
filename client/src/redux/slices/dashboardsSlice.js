import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to fetch dashboards
export const fetchDashboards = createAsyncThunk(
  "dashboards/fetchDashboards",
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/dashboards", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data.dashboards;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to create a dashboard
export const createDashboard = createAsyncThunk(
  "dashboards/createDashboard",
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/dashboards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data.dashboard; // Return the new dashboard
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardsSlice = createSlice({
  name: "dashboards",
  initialState: {
    data: [], // List of dashboards
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearDashboardsState: (state) => {
      state.data = [];
      state.status = "idle";
      state.error = null;
    },
    addRestaurantToDashboard: (state, action) => {
      const { dashboardId, restaurant } = action.payload;
      const dashboard = state.data.find((d) => d._id === dashboardId);
      if (dashboard) {
        dashboard.restaurants.push(restaurant);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // For fetching dashboards
      .addCase(fetchDashboards.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDashboards.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchDashboards.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch dashboards";
      })

      // For creating dashboards
      .addCase(createDashboard.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createDashboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data.push(action.payload); // Add the new dashboard to the list
      })
      .addCase(createDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to create dashboard";
      });
  },
});

export const { clearDashboardsState, addRestaurantToDashboard } =
  dashboardsSlice.actions;

export default dashboardsSlice.reducer;
