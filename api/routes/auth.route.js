// routes/auth.route.js
import express from "express";
import {
  signup,
  signin,
  google,
  getUserAccessData,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);
router.get("/user-access/:userId", getUserAccessData); // New route to fetch user access data

export default router;
