import mongoose from "mongoose";

const dashboardSchema = new mongoose.Schema(
  {
    dashboardId: {
      type: String,
      required: true,
      unique: true,
    },
    dashboardOwnerId: {
      type: String,
      ref: "User",
      required: true,
      unique: true, // Each owner should have only one dashboard
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
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Dashboard = mongoose.model("Dashboard", dashboardSchema);
export default Dashboard;
