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
    res.status(201).json({
      message: "Signup with email and password successful",
      user: newUser,
    });
  } catch (error) {
    // Handle database errors
    return next(errorHandler(500, "Error saving user"));
  }
};

export const signin = async (req, res, next) => {
  const { email } = req.body;

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }
    res.status(201).json({
      message: "Sign in successful",
      user: validUser,
    });
  } catch {}
};

export const google = async (req, res, next) => {
  const { uid, username, email, googlePhotoUrl } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(201).json({ message: "Signin successful", user: user });
    } else {
      const newUser = new User({
        uid,
        username,
        email,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      res
        .status(201)
        .json({ message: "Signup with Google successful", user: newUser });
    }
  } catch {
    return next(errorHandler(500, "Error signin user with Google"));
  }
};
