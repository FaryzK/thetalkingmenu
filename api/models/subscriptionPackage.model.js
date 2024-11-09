import mongoose from "mongoose";

const subscriptionPackageSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["basic", "premium", "test"],
    default: "test",
  },
  tokenLimitPerMonth: {
    type: Number,
    default: 5000,
  },
  price: {
    type: Number,
    default: 0, // Default price for a test plan
  },
  paymentSchedule: {
    type: String,
    enum: ["monthly", "annually"],
    default: "monthly",
  },
});

const SubscriptionPackage = mongoose.model(
  "SubscriptionPackage",
  subscriptionPackageSchema
);
export default SubscriptionPackage;
