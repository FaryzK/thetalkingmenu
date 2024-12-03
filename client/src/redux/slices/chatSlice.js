import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to initiate a new chat and retrieve chatId
export const startNewChat = createAsyncThunk(
  "chat/startNewChat",
  async ({ restaurantId, userId, tableNumber }) => {
    const response = await fetch(`/api/chat/start-new-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, userId, tableNumber }),
    });
    if (!response.ok) throw new Error("Failed to start new chat");
    return await response.json(); // Should return { chatId }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ restaurantId, userId = null, tableNumber, message }) => {
    const response = await fetch(`/api/chat/send-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, userId, tableNumber, message }),
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
    chatId: null, // Add chatId if it's not already included
    tableNumber: null, // Include tableNumber in the state
  },
  reducers: {
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
    setMessages(state, action) {
      state.messages = action.payload;
    },
    clearMessages(state) {
      state.messages = [];
    },
    setChatId(state, action) {
      state.chatId = action.payload;
    },
    setTableNumber(state, action) {
      // New reducer for setting tableNumber
      state.tableNumber = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startNewChat.fulfilled, (state, action) => {
        state.chatId = action.payload.chatId;
        state.tableNumber = action.payload.tableNumber; // Save tableNumber
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

export const { addMessage, setMessages, setChatId, clearMessages } =
  chatSlice.actions;
export default chatSlice.reducer;
