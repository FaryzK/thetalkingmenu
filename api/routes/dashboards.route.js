import express from "express";
import {
  getDashboards,
  createDashboard,
  deleteDashboard,
  getAllDashboards,
} from "../controllers/dashboards.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";
import { isAdmin } from "../utils/isAdmin.js";

const router = express.Router();

// Route to create a new dashboard
router.post("/", isAuthenticated, createDashboard);
router.get("/", isAuthenticated, getDashboards);
router.delete("/:dashboardId", isAuthenticated, deleteDashboard);
router.get("/all", isAuthenticated, isAdmin, getAllDashboards);

export default router;
