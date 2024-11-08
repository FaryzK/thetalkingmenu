import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to initiate a new chat and retrieve chatId
export const startNewChat = createAsyncThunk(
  "chat/startNewChat",
  async ({ restaurantId, userId }) => {
    const response = await fetch(`/api/chat/start-new-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, userId }),
    });
    if (!response.ok) throw new Error("Failed to start new chat");
    return await response.json(); // Should return { chatId }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ restaurantId, userId = null, message }) => {
    const response = await fetch(`/api/chat/send-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, userId, message }),
    });
    if (!response.ok) throw new Error("Failed to send message");
    return await response.json(); // Expecting response with assistant message details
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    status: "idle",
    error: null,
  },
  reducers: {
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
    clearMessages(state) {
      state.messages = [];
    },
    setChatId(state, action) {
      state.chatId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startNewChat.fulfilled, (state, action) => {
        state.chatId = action.payload.chatId;
      })
      .addCase(startNewChat.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(sendMessage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = "succeeded";

        // Add both user and assistant messages
        state.messages.push(
          { role: "user", content: action.meta.arg.message },
          {
            role: "assistant",
            content: action.payload.choices[0].message.content,
          }
        );
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { addMessage, setChatId, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
