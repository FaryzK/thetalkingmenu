// models/globalSystemPrompt.model.js
import mongoose from "mongoose";

const globalSystemPromptSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
  },
});

const GlobalSystemPrompt = mongoose.model(
  "GlobalSystemPrompt",
  globalSystemPromptSchema
);
export default GlobalSystemPrompt;
