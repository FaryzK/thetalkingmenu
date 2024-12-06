// frontend/src/redux/slices/platformControlPanelUsersSlice.js

import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";

// Thunk to fetch users from backend
// Pagination and filtering handled by query parameters
export const fetchUsers = createAsyncThunk(
  "platformControlPanelUsers/fetchUsers",
  async ({ token, page = 1, search = "" }) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: "20",
      search: search.trim(),
    });
    const response = await fetch(`/api/user?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    const data = await response.json();
    return data; // { users: [...], total: number }
  }
);

// Thunk to update user roles
export const updateUserRoles = createAsyncThunk(
  "platformControlPanelUsers/updateUserRoles",
  async ({ token, userId, roles }) => {
    const response = await fetch(`/api/user/${userId}/roles`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roles }),
    });
    if (!response.ok) {
      throw new Error("Failed to update user roles");
    }
    const data = await response.json();
    return data; // { user: updatedUser }
  }
);

const initialState = {
  users: [],
  total: 0,
  page: 1,
  search: "",
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const platformControlPanelUsersSlice = createSlice({
  name: "platformControlPanelUsers",
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload;
    },
    setSearchTerm(state, action) {
      state.search = action.payload;
      state.page = 1; // reset to first page on new search
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload.users;
        state.total = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateUserRoles.fulfilled, (state, action) => {
        // Update the user in the state with the new roles
        const updatedUser = action.payload.user;
        const index = state.users.findIndex((u) => u._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      });
  },
});

export const { setPage, setSearchTerm } =
  platformControlPanelUsersSlice.actions;

export default platformControlPanelUsersSlice.reducer;

// Memoized selector to get users
export const selectUsers = (state) => state.platformControlPanelUsers.users;
export const selectTotalUsers = (state) =>
  state.platformControlPanelUsers.total;
export const selectPage = (state) => state.platformControlPanelUsers.page;
export const selectSearchTerm = (state) =>
  state.platformControlPanelUsers.search;
export const selectUserStatus = (state) =>
  state.platformControlPanelUsers.status;

// Example memoized selector (if needed for performance)
export const selectFilteredUsers = createSelector(
  [selectUsers, selectSearchTerm],
  (users, search) => {
    const term = search.toLowerCase();
    return users.filter(
      (user) =>
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
    );
  }
);
