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
        type: String, //role in the given restaurant, either restaurant main admin or restaurant admin
        required: true,
      },
    },
  ],
  logo: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/4904/4904233.png", // Default logo URL
  },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
