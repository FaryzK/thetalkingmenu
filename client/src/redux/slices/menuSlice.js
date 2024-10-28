// src/redux/slices/menuSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunks for async actions
export const fetchMenu = createAsyncThunk(
  "menu/fetchMenu",
  async ({ token, restaurantId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/menu`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch menu");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMenuItem = createAsyncThunk(
  "menu/fetchMenuItem",
  async ({ token, restaurantId, itemId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/restaurants/${restaurantId}/menu/${itemId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch menu item");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addMenuItem = createAsyncThunk(
  "menu/addMenuItem",
  async ({ token, restaurantId, newItem }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/menu`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) throw new Error("Failed to add menu item");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  "menu/updateMenuItem",
  async ({ token, restaurantId, itemId, updatedItem }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/restaurants/${restaurantId}/menu/${itemId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedItem),
        }
      );
      if (!response.ok) throw new Error("Failed to update menu item");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  "menu/deleteMenuItem",
  async ({ token, restaurantId, itemId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/restaurants/${restaurantId}/menu/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete menu item");
      return itemId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const menuSlice = createSlice({
  name: "menu",
  initialState: {
    data: { menuItems: [] },
    status: "idle",
    error: null,
  },
  reducers: {
    clearMenuState: (state) => {
      state.data = { menuItems: [] };
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchMenuItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMenuItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.item = action.payload;
      })
      .addCase(fetchMenuItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addMenuItem.fulfilled, (state, action) => {
        state.data.menuItems.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const { itemId, updatedItem } = action.payload;
        const index = state.data.menuItems.findIndex(
          (item) => item._id === itemId
        );
        if (index !== -1) state.data.menuItems[index] = updatedItem;
        state.status = "succeeded";
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.data.menuItems = state.data.menuItems.filter(
          (item) => item._id !== action.payload
        );
        state.status = "succeeded";
      });
  },
});

export const { clearMenuState } = menuSlice.actions;
export default menuSlice.reducer;
