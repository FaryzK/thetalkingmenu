import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import dashboardsRoutes from "./routes/dashboards.route.js";
import restaurantsRoutes from "./routes/restaurant.route.js";
import menuRoutes from "./routes/menu.route.js";
import chatBotRoutes from "./routes/chatBot.route.js";
import employeeAccessRoutes from "./routes/employeeAccess.route.js";
import chatRoutes from "./routes/chat.route.js";
import globalSystemPromptRoutes from "./routes/globalSystemPrompt.route.js";
import restaurantAnalyticsRoutes from "./routes/restaurantAnalytics.route.js";
import path from "path";
import cors from "cors";

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((err) => {
    console.log(err);
  });

const __dirname = path.resolve();

const app = express();

// CORS Middleware
app.use(
  cors({
    origin: "https://thetalkingmenu.onrender.com", // Replace with your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
    credentials: true, // Allow cookies/authorization headers
  })
);

app.use(express.json());

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboards", dashboardsRoutes);
app.use("/api/restaurants", restaurantsRoutes);
app.use("/api", menuRoutes);
app.use("/api/chatbot", chatBotRoutes);
app.use("/api/employee-access", employeeAccessRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/global-system-prompt", globalSystemPromptRoutes);
app.use("/api/restaurant-analytics", restaurantAnalyticsRoutes);

// Handle API route 404s (for /api endpoints)
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.use(express.static(path.join(__dirname, "client/dist")));

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"))
);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
