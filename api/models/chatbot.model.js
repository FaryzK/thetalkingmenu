import mongoose from "mongoose";

const chatbotSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ["on", "off"],
    default: "on",
  },
  qrScanOnly: {
    type: Boolean,
    default: false, // Default is false, which means copy-pasting is allowed
  },
});

const Chatbot =
  mongoose.models.Chatbot || mongoose.model("Chatbot", chatbotSchema);

// Done this way because previously we named the db chatBot instead of chatbot

export default Chatbot;
