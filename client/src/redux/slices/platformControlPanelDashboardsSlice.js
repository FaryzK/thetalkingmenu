import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// **Fetch dashboards with pagination and search**
export const fetchAllDashboards = createAsyncThunk(
  "platformControlPanelDashboards/fetchAllDashboards",
  async ({ token, page = 1, search = "" }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/dashboards/all?page=${page}&search=${search}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data);
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteDashboard = createAsyncThunk(
  "platformControlPanelDashboards/deleteDashboard",
  async ({ token, dashboardId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/dashboards/${dashboardId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        return rejectWithValue(data.message || "Failed to delete dashboard");
      }

      return dashboardId; // Return the deleted dashboardId to update the state
    } catch (error) {
      return rejectWithValue(error.message || "Network error occurred");
    }
  }
);

const platformControlPanelDashboardsSlice = createSlice({
  name: "platformControlPanelDashboards",
  initialState: {
    dashboards: [],
    totalPages: 0,
    currentPage: 1,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllDashboards.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllDashboards.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dashboards = action.payload.dashboards;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAllDashboards.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete Dashboard Logic
      .addCase(deleteDashboard.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteDashboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Remove the deleted dashboard from the state
        state.dashboards = state.dashboards.filter(
          (dashboard) => dashboard._id !== action.payload
        );
      })
      .addCase(deleteDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default platformControlPanelDashboardsSlice.reducer;
