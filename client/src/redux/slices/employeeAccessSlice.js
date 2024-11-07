// employeeAccessSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  updateAccessibleDashboards,
  updateAccessibleRestaurants,
} from "./userSlice";
import { updateDashboardEmployees } from "./dashboardsSlice";
import { fetchRestaurant } from "./restaurantSlice";

// Async thunk for revoking employee access
export const revokeEmployeeAccess = createAsyncThunk(
  "employeeAccess/revokeEmployeeAccess",
  async (
    { dashboardId, restaurantId, userId, token },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await fetch("/api/employee-access/revoke", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dashboardId, restaurantId, userId }),
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to revoke employee access"
        );
      }

      // Dispatch updates to related slices
      dispatch(updateAccessibleDashboards(data.updatedAccessibleDashboards));
      dispatch(updateAccessibleRestaurants(data.updatedAccessibleRestaurants));
      dispatch(
        updateDashboardEmployees({
          dashboardId,
          employees: data.updatedEmployeesWithAccess,
        })
      );
      dispatch(fetchRestaurant({ token, restaurantId })); // Refresh restaurant data if needed

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// employeeAccess slice
const employeeAccessSlice = createSlice({
  name: "employeeAccess",
  initialState: {
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(revokeEmployeeAccess.pending, (state) => {
        state.status = "loading";
      })
      .addCase(revokeEmployeeAccess.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(revokeEmployeeAccess.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to revoke employee access";
      });
  },
});

export const { clearError } = employeeAccessSlice.actions;
export default employeeAccessSlice.reducer;
