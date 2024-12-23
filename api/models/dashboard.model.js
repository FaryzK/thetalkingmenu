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
          // Role of the user under the specific dashboard (e.g., restaurant admin or restaurant main admin)
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
