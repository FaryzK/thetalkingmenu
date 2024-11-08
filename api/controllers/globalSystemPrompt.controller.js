// controllers/globalSystemPrompt.controller.js
import GlobalSystemPrompt from "../models/globalSystemPrompt.model.js";

export const getGlobalSystemPrompt = async (req, res, next) => {
  try {
    const prompt = await GlobalSystemPrompt.findOne();
    res.json(prompt || { prompt: "" });
  } catch (error) {
    console.error("Error fetching global system prompt:", error);
    next(error);
  }
};

export const createGlobalSystemPrompt = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const newPrompt = new GlobalSystemPrompt({ prompt });
    await newPrompt.save();
    res.status(201).json(newPrompt);
  } catch (error) {
    console.error("Error creating global system prompt:", error);
    next(error);
  }
};

export const updateGlobalSystemPrompt = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const updatedPrompt = await GlobalSystemPrompt.findOneAndUpdate(
      {},
      { prompt },
      { new: true, upsert: true }
    );
    res.json(updatedPrompt);
  } catch (error) {
    console.error("Error updating global system prompt:", error);
    next(error);
  }
};
