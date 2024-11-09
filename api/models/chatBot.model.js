// models/chatBot.model.js
import mongoose from "mongoose";

const chatBotSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  systemPrompt: {
    type: String,
    default: "",
  },
  suggestedQuestions: [
    {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // store raw JSON content that Draft.js can handle on front end
    },
  ],
});

const ChatBot = mongoose.model("ChatBot", chatBotSchema);
export default ChatBot;
