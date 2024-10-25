import mongoose from "mongoose";

const dashboardSchema = new mongoose.Schema(
  {
    dashboardOwnerId: {
      type: String, // Use String for Firebase UID
      ref: "User",
      required: true,
      unique: true,
    },
    restaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    restaurantAdmins: [
      {
        type: String, // Use String for Firebase UID
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Dashboard = mongoose.model("Dashboard", dashboardSchema);
export default Dashboard;
