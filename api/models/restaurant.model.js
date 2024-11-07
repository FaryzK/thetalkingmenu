// restaurant.model.js
import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  restaurantOwnerId: {
    type: String,
    required: true,
  },
  menu: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
    },
  ],
  chats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  ],
  tokensUsed: {
    type: Number,
    default: 0,
  },
  userAccess: [
    {
      userId: {
        type: String, // Use String for Firebase UID
        required: true,
      },
      userEmail: {
        type: String,
        required: true,
      },
      role: {
        type: String, //role in the give restaurant, either restaurant main admin or restaurant admin
        required: true,
      },
    },
  ],
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;