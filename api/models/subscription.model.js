import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
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
    default: 0, // Since it's a test plan
  },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
