// userAccessSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addRestaurantToDashboard } from "./dashboardsSlice";
import { removeEmployeeFromDashboard } from "./dashboardsSlice"; // Import the necessary action for dashboards
import { removeEmployeeFromRestaurant } from "./restaurantSlice"; // Import the necessary action for restaurants

//
export const fetchUserAccessData = createAsyncThunk(
  "userAccess/fetchUserAccessData",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/auth/user-access/${userId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user access data");
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to add employee access
export const addEmployeeAccess = createAsyncThunk(
  "userAccess/addEmployeeAccess",
  async (
    { email, role, dashboardId, restaurantId, token },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/employee-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, role, dashboardId, restaurantId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to add employee access");
      }

      // Update access fields in userAccessSlice for dashboards and restaurants
      dispatch(setAccessibleDashboards(data.accessibleDashboards));
      dispatch(setAccessibleRestaurants(data.accessibleRestaurants));

      // Update the `userAccess` field for the restaurant and dashboard slices if needed
      dispatch(
        addRestaurantToDashboard({ dashboardId, restaurant: data.restaurant })
      );

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to revoke employee access
export const revokeEmployeeAccess = createAsyncThunk(
  "userAccess/revokeEmployeeAccess",
  async (
    { dashboardId, restaurantId, userId, token },
    { getState, dispatch, rejectWithValue }
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

      // Get the current logged-in user ID
      const { currentUser } = getState().user;
      const currentUserId = currentUser?.uid;

      // Update Redux state only if the revoked user is the current user
      if (currentUserId === userId) {
        dispatch(setAccessibleDashboards(data.accessibleDashboards));
        dispatch(setAccessibleRestaurants(data.accessibleRestaurants));
      }

      // Remove employee from dashboard and restaurant slices, regardless of who the current user is
      dispatch(removeEmployeeFromDashboard({ dashboardId, userId }));
      dispatch(removeEmployeeFromRestaurant({ restaurantId, userId }));

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userAccessSlice = createSlice({
  name: "userAccess",
  initialState: {
    accessibleDashboards: [],
    accessibleRestaurants: [],
    status: "idle",
    error: null,
  },
  reducers: {
    setAccessibleDashboards: (state, action) => {
      state.accessibleDashboards = action.payload;
    },
    setAccessibleRestaurants: (state, action) => {
      state.accessibleRestaurants = action.payload;
    },
    clearAccessState: (state) => {
      state.accessibleDashboards = [];
      state.accessibleRestaurants = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addEmployeeAccess.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addEmployeeAccess.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(addEmployeeAccess.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to add employee access";
      })
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
      })
      .addCase(fetchUserAccessData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserAccessData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accessibleDashboards = action.payload.accessibleDashboards;
        state.accessibleRestaurants = action.payload.accessibleRestaurants;
        state.lastFetched = Date.now();
      })
      .addCase(fetchUserAccessData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch access data";
      });
  },
});

export const {
  setAccessibleDashboards,
  setAccessibleRestaurants,
  clearAccessState,
} = userAccessSlice.actions;

export default userAccessSlice.reducer;
