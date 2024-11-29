import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to fetch restaurant chats
export const fetchRestaurantChats = createAsyncThunk(
  "restaurantChats/fetchRestaurantChats",
  async ({ token, restaurantId }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/chat/${restaurantId}/chats?page=1&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch chats");
      return data; // { chats, totalChats }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const restaurantChatsSlice = createSlice({
  name: "restaurantChats",
  initialState: {
    data: [],
    totalChats: 0,
    status: "idle",
    error: null,
  },
  reducers: {
    clearRestaurantChatsState: (state) => {
      state.data = [];
      state.totalChats = 0;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantChats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRestaurantChats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.chats;
        state.totalChats = action.payload.totalChats;
      })
      .addCase(fetchRestaurantChats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearRestaurantChatsState } = restaurantChatsSlice.actions;
export default restaurantChatsSlice.reducer;
