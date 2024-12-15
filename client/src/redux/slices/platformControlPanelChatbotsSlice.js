// redux/slices/platformControlChatbotsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchChatbots = createAsyncThunk(
  "chatbots/fetchChatbots",
  async ({ search, page, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/chatbot?search=${encodeURIComponent(
          search
        )}&page=${page}&limit=20`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chatbots");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

export const updateChatbotStatus = createAsyncThunk(
  "chatbots/updateChatbotStatus",
  async ({ restaurantId, status, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/chatbot/${restaurantId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update chatbot status");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

const platformControlChatbotsSlice = createSlice({
  name: "platformControlChatbots",
  initialState: {
    chatbots: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Chatbots
      .addCase(fetchChatbots.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatbots.fulfilled, (state, action) => {
        state.loading = false;
        state.chatbots = action.payload.chatbots;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchChatbots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Chatbot Status
      .addCase(updateChatbotStatus.fulfilled, (state, action) => {
        const updatedChatbot = action.payload;
        state.chatbots = state.chatbots.map((chatbot) =>
          chatbot._id === updatedChatbot._id ? updatedChatbot : chatbot
        );
      });
  },
});

export default platformControlChatbotsSlice.reducer;
