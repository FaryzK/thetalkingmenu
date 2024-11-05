import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import dashboardsRoutes from "./routes/dashboards.route.js";
import subscriptionsRoutes from "./routes/subscriptions.route.js";
import restaurantsRoutes from "./routes/restaurant.route.js";
import menuRoutes from "./routes/menu.route.js";
import chatBotRoutes from "./routes/chatBot.route.js";
import employeeAccessRoutes from "./routes/employeeAccess.route.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use(express.json());

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboards", dashboardsRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api", restaurantsRoutes);
app.use("/api", menuRoutes);
app.use("/api/chatbot", chatBotRoutes);
app.use("/api/employee-access", employeeAccessRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
