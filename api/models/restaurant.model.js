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
        type: String, // Role in the given restaurant, either restaurant main admin or restaurant admin
        required: true,
      },
    },
  ],
  logo: {
    type: String,
    default: "",
  },
  menuLink: {
    type: String, // URL for the menu
    default: "",
  },
  orderLink: {
    type: String, // URL for online ordering
    default: "",
  },
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
