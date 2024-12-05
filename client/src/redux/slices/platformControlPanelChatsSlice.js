import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to fetch restaurant chats
export const fetchRestaurantChats = createAsyncThunk(
  "platformControlPanelChat/fetchRestaurantChats",
  async ({ token, restaurantId, page, limit }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/chat/${restaurantId}/chats?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch chats");
      return { chats: data.chats, totalChats: data.totalChats };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Search chats by keyword
export const searchRestaurantChats = createAsyncThunk(
  "platformControlPanelChat/searchRestaurantChats",
  async (
    { token, restaurantId, keyword, page, limit },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `/api/chat/${restaurantId}/search?keyword=${encodeURIComponent(
          keyword
        )}&page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to search chats");
      return { chats: data.chats, totalChats: data.totalChats };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a chat by ID
export const deleteChat = createAsyncThunk(
  "platformControlPanelChat/deleteChat",
  async ({ token, chatId, restaurantId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete chat");

      return { chatId, restaurantId, stats: data.updatedStats };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const platformControlPanelChatsSlice = createSlice({
  name: "platformControlPanelChat",
  initialState: {
    allChats: [],
    searchResults: { chats: [], totalChats: 0 },
    totalChats: 0,
    totalSearchChats: 0,
    status: "idle",
    error: null,
  },
  reducers: {
    clearChatState: (state) => {
      state.allChats = [];
      state.searchResults = { chats: [], totalChats: 0 };
      state.totalChats = 0;
      state.totalSearchChats = 0;
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
        state.allChats = action.payload.chats;
        state.totalChats = action.payload.totalChats;
      })
      .addCase(fetchRestaurantChats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(searchRestaurantChats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchRestaurantChats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.searchResults = action.payload.chats;
        state.totalSearchChats = action.payload.totalChats;
      })
      .addCase(searchRestaurantChats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteChat.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.status = "succeeded";

        // Remove the deleted chat from allChats
        state.allChats = state.allChats.filter(
          (chat) => chat._id !== action.payload.chatId
        );

        // Remove the deleted chat from searchResults, if applicable
        if (state.searchResults?.chats) {
          state.searchResults.chats = state.searchResults.chats.filter(
            (chat) => chat._id !== action.payload.chatId
          );
        }

        // Update totalChats and totalSearchChats
        state.totalChats = Math.max(0, state.totalChats - 1);
        state.totalSearchChats = Math.max(0, state.totalSearchChats - 1);
      })
      .addCase(deleteChat.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearChatState } = platformControlPanelChatsSlice.actions;
export default platformControlPanelChatsSlice.reducer;
