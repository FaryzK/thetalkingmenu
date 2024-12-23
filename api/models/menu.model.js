import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  menuItems: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
      },
      name: { type: String, required: true },
      description: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
});

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
