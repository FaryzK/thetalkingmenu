// models/dashboard.model.js
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
    customerSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerSubscription",
    },
    userAccess: [
      {
        userId: {
          type: String, // Firebase UID
          required: true,
        },
        userEmail: {
          type: String,
          required: true,
        },
        role: {
          //role of the user under the specific dashboard. Either restaurant admin or restaurant main admin
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Dashboard = mongoose.model("Dashboard", dashboardSchema);
export default Dashboard;
