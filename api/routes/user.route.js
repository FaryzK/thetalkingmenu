// backend/routes/user.route.js
import express from "express";
import { getUsers, updateUserRoles } from "../controllers/user.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";
import { isAdmin } from "../utils/isAdmin.js";

const router = express.Router();

// GET /api/user?search=...&page=...&limit=...
router.get("/", isAuthenticated, isAdmin, getUsers);

// PUT /api/user/:userId/roles
router.put("/:userId/roles", isAuthenticated, isAdmin, updateUserRoles);

export default router;
