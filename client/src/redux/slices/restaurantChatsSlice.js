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
  async (
    { token, restaurantId, page = 1, limit = 20 },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `/api/chat/${restaurantId}/starred?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch starred chats");
      return {
        chats: data.chats, // Array of starred chats
        totalChats: data.totalChats, // Total starred chat count
        page,
      };
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

export const searchRestaurantChats = createAsyncThunk(
  "restaurantChats/searchRestaurantChats",
  async (
    {
      token,
      restaurantId,
      keyword,
      filterStarred = false,
      page = 1,
      limit = 20,
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `/api/chat/${restaurantId}/search?keyword=${encodeURIComponent(
          keyword
        )}&page=${page}&limit=${limit}${filterStarred ? "&starred=true" : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to search chats");
      return { chats: data.chats, totalChats: data.totalChats, page };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const restaurantChatsSlice = createSlice({
  name: "restaurantChats",
  initialState: {
    allChats: [], // Regular chats
    starredChats: [], // Starred chats
    searchResults: [], // Searched chats
    totalChats: 0, // Total chats for pagination
    totalStarredChats: 0, // Total starred chats for pagination
    status: "idle",
    error: null,
  },
  reducers: {
    clearRestaurantChatsState: (state) => {
      state.allChats = [];
      state.starredChats = [];
      state.searchResults = [];
      state.totalChats = 0;
      state.totalStarredChats = 0;
      state.status = "idle";
      state.error = null;
    },
    updateSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurantChats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRestaurantChats.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allChats = action.payload.chats.map((chat) => ({
          ...chat,
          tableNumber: chat.tableNumber,
        }));
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
        state.starredChats = action.payload.chats; // Starred chats for current page
        state.totalStarredChats = action.payload.totalChats; // Total starred chat count
      })
      .addCase(fetchStarredChats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(toggleStarChat.pending, (state) => {
        state.status = "loading"; // Set status to loading when the action is pending
      })
      .addCase(toggleStarChat.fulfilled, (state, action) => {
        state.status = "succeeded";

        const { chatId, starred } = action.payload;

        // Update starredChats based on the new status
        if (starred) {
          const chat =
            state.allChats.find((c) => c._id === chatId) ||
            state.searchResults.chats.find((c) => c._id === chatId);
          if (chat && !state.starredChats.some((c) => c._id === chatId)) {
            state.starredChats.push({ ...chat, isStarred: true });
          }
        } else {
          state.starredChats = state.starredChats.filter(
            (c) => c._id !== chatId
          );
        }

        // Update the starred status in allChats
        state.allChats = state.allChats.map((chat) =>
          chat._id === chatId ? { ...chat, isStarred: starred } : chat
        );

        // Update the searchResults if applicable
        if (state.searchResults && state.searchResults.chats) {
          state.searchResults.chats = state.searchResults.chats.map((chat) =>
            chat._id === chatId ? { ...chat, isStarred: starred } : chat
          );
        }
      })
      .addCase(toggleStarChat.rejected, (state, action) => {
        state.status = "failed"; // Set status to failed when the action is rejected
        state.error = action.payload; // Save the error message
      })
      .addCase(searchRestaurantChats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchRestaurantChats.fulfilled, (state, action) => {
        state.status = "succeeded";

        const starredChatIds = state.starredChats.map((chat) => chat._id);

        // Add isStarred property based on starredChats
        state.searchResults = {
          ...action.payload,
          chats: action.payload.chats.map((chat) => ({
            ...chat,
            isStarred: starredChatIds.includes(chat._id),
          })),
        };
      })
      .addCase(searchRestaurantChats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearRestaurantChatsState, updateSearchResults } =
  restaurantChatsSlice.actions;
export default restaurantChatsSlice.reducer;
