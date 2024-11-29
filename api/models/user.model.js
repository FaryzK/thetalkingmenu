// models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      trim: true, // Ensure no unnecessary whitespace
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    profilePicture: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/17492/17492071.png",
    },
    roles: {
      type: [String],
      default: ["diner"],
      enum: [
        "diner",
        "restaurant admin",
        "restaurant main admin",
        "the talking menu admin",
      ],
    },
    accessibleDashboards: [
      {
        type: String, // Store dashboard IDs as an array of strings
      },
    ],
    accessibleRestaurants: [
      {
        type: String, // Store restaurant IDs as an array of strings
      },
    ],
    starredChats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
  },
  { timestamps: true }
);

// Optionally ensure unique starredChats per user
userSchema.path("starredChats").validate(function (value) {
  return new Set(value).size === value.length; // Check for duplicate entries
}, "Duplicate chat IDs in starredChats");

const User = mongoose.model("User", userSchema);

export default User;
