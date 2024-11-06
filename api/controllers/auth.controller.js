import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  const { uid, username, email } = req.body;

  if (!uid || !email || !username) {
    return next(errorHandler(400, "All fields are required"));
  }

  const newUser = new User({ uid, username, email });

  try {
    await newUser.save();

    res.status(201).json({
      message: "Signup with email and password successful",
      user: newUser,
    });
  } catch (error) {
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
      user: {
        ...validUser.toObject(),
        accessibleDashboards: validUser.accessibleDashboards,
        accessibleRestaurants: validUser.accessibleRestaurants,
      },
    });
  } catch (error) {
    next(errorHandler(500, "Sign in failed"));
  }
};

export const google = async (req, res, next) => {
  const { uid, username, email, googlePhotoUrl } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(201).json({
        message: "Signin successful",
        user: {
          ...user.toObject(),
          accessibleDashboards: user.accessibleDashboards,
          accessibleRestaurants: user.accessibleRestaurants,
        },
      });
    } else {
      const newUser = new User({
        uid,
        username,
        email,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      res.status(201).json({
        message: "Signup with Google successful",
        user: {
          ...newUser.toObject(),
          accessibleDashboards: newUser.accessibleDashboards,
          accessibleRestaurants: newUser.accessibleRestaurants,
        },
      });
    }
  } catch (error) {
    next(errorHandler(500, "Error signing in with Google"));
  }
};

// New controller function to fetch user access data
export const getUserAccessData = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne(
      { uid: userId },
      "accessibleDashboards accessibleRestaurants"
    );
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      accessibleDashboards: user.accessibleDashboards,
      accessibleRestaurants: user.accessibleRestaurants,
    });
  } catch (error) {
    next(errorHandler(500, "Failed to retrieve user access data"));
  }
};
