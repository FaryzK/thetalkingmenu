import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  const { uid, username, email } = req.body;

  if (!uid || !email || !username) {
    // Return after handling the error
    return next(errorHandler(400, "All fields are required"));
  }

  const newUser = new User({ uid, username, email });

  try {
    // Save the user to the database
    await newUser.save();

    // Send a success response
    res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (error) {
    // Handle database errors
    return next(errorHandler(500, "Error saving user"));
  }
};
