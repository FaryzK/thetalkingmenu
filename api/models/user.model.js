import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true, // This ensures no duplicate Firebase UID exists
    },
    name: String,
    email: String,
    profileImage: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
