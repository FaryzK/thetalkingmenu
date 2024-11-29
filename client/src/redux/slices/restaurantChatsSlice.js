import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to fetch restaurant chats
export const fetchRestaurantChats = createAsyncThunk(
  "restaurantChats/fetchRestaurantChats",
  async (
    { token, restaurantId, page = 1, limit = 20 },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `/api/chat/${restaurantId}/chats?page=${page}&limit=${limit}`,
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

// Thunk to fetch starred chats
export const fetchStarredChats = createAsyncThunk(
  "restaurantChats/fetchStarredChats",
  async ({ token, restaurantId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/chat/${restaurantId}/starred`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch starred chats");
      return data; // Expecting an array of starred chats
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to toggle star/unstar a chat
export const toggleStarChat = createAsyncThunk(
  "restaurantChats/toggleStarChat",
  async ({ token, chatId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/toggleStarChat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to toggle star status");
      return { chatId, starred: data.starred }; // Return chatId and new starred status
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const restaurantChatsSlice = createSlice({
  name: "restaurantChats",
  initialState: {
    allChats: [], // For regular chats
    starredChats: [], // For starred chats
    totalChats: 0, // Total number of regular chats for pagination
    status: "idle",
    error: null,
  },
  reducers: {
    clearRestaurantChatsState: (state) => {
      state.allChats = [];
      state.starredChats = [];
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
        state.allChats = action.payload.chats; // Store in allChats
        state.totalChats = action.payload.totalChats;
      })
      .addCase(fetchRestaurantChats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchStarredChats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStarredChats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.starredChats = action.payload; // Update starred chats
      })
      .addCase(fetchStarredChats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(toggleStarChat.pending, (state) => {
        state.status = "loading"; // Set status to loading when the action is pending
      })
      .addCase(toggleStarChat.fulfilled, (state, action) => {
        state.status = "succeeded"; // Set status to succeeded when the action is fulfilled

        const { chatId, starred } = action.payload;

        // Update starredChats based on the new status
        if (starred) {
          // Add to starredChats if not already present
          const chat = state.allChats.find((c) => c._id === chatId);
          if (chat && !state.starredChats.some((c) => c._id === chatId)) {
            state.starredChats.push(chat);
          }
        } else {
          // Remove from starredChats
          state.starredChats = state.starredChats.filter(
            (c) => c._id !== chatId
          );
        }
      })
      .addCase(toggleStarChat.rejected, (state, action) => {
        state.status = "failed"; // Set status to failed when the action is rejected
        state.error = action.payload; // Save the error message
      });
  },
});

export const { clearRestaurantChatsState } = restaurantChatsSlice.actions;
export default restaurantChatsSlice.reducer;
