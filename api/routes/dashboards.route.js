import express from "express";
import { createDashboard } from "../controllers/dashboards.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";

const router = express.Router();

// Route to create a new dashboard
router.post("/", isAuthenticated, createDashboard);

export default router;
