// models/userChats.model.js
import mongoose from "mongoose";

const userChatsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true, // One document per user
  },
  chatIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Chat",
    default: [],
  },
});

const UserChats = mongoose.model("UserChat", userChatsSchema);
export default UserChats;
