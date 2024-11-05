// routes/employeeAccess.routes.js
import express from "express";
import {
  addEmployeeAccess,
  revokeEmployeeAccess,
} from "../controllers/employeeAccess.controller.js";
import { isAuthenticated } from "../utils/isAuthenticated.js";

const router = express.Router();

router.post("/", isAuthenticated, addEmployeeAccess);
router.delete("/revoke", isAuthenticated, revokeEmployeeAccess);

export default router;
