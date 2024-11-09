import mongoose from "mongoose";

const customerSubscriptionSchema = new mongoose.Schema({
  dashboardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dashboard",
    required: true,
  },
  subscriptionPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPackage",
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true, // Ensure it’s set based on the subscription duration
  },
  status: {
    type: String,
    enum: ["active", "expired", "canceled", "paused"],
    default: "active",
  },
  nextBillingDate: {
    type: Date,
  },
  renewal: {
    type: Boolean,
    default: true,
  },
});

const CustomerSubscription = mongoose.model(
  "CustomerSubscription",
  customerSubscriptionSchema
);
export default CustomerSubscription;
