import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true, // This ensures no duplicate Firebase UID exists
    },
    username: String,
    email: String,
    profilePicture: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/17492/17492071.png",
    },
    roles: {
      type: [String],
      default: ["diner"], // By default, the user is assigned the "diner" role
      enum: [
        "diner",
        "restaurant admin",
        "restaurant main admin",
        "talking menu admin",
      ],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
