// src/redux/slices/chatBotSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch ChatBot data
export const fetchChatBot = createAsyncThunk(
  "chatBot/fetchChatBot",
  async ({ token, restaurantId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/chatbot/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch chatbot data");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update System Prompt
export const updateSystemPrompt = createAsyncThunk(
  "chatBot/updateSystemPrompt",
  async ({ token, restaurantId, systemPrompt }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/chatbot/${restaurantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ systemPrompt }),
      });
      if (!response.ok) throw new Error("Failed to update system prompt");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update Suggested Questions
export const updateSuggestedQuestions = createAsyncThunk(
  "chatBot/updateSuggestedQuestions",
  async ({ token, restaurantId, suggestedQuestions }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/chatbot/${restaurantId}/suggested-questions`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ suggestedQuestions }),
        }
      );
      if (!response.ok) throw new Error("Failed to update suggested questions");
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const chatBotSlice = createSlice({
  name: "chatBot",
  initialState: { data: null, status: "idle", error: null },
  reducers: {
    clearChatBotState: (state) => {
      state.data = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatBot.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchChatBot.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchChatBot.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateSystemPrompt.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateSystemPrompt.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data.systemPrompt = action.payload.systemPrompt;
      })
      .addCase(updateSystemPrompt.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateSuggestedQuestions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data.suggestedQuestions = action.payload.suggestedQuestions;
      });
  },
});

export const { clearChatBotState } = chatBotSlice.actions;
export default chatBotSlice.reducer;
