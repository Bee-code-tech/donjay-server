import express from "express";
import {
  getAllUsers,
  getUserById,
  suspendUser,
  deleteUser
} from "../controllers/users.controller.js";
import { protectRoute, adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protectRoute);

// Admin-only routes
router.use(adminOnly);

// Routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id/suspend", suspendUser);
router.delete("/:id", deleteUser);

export default router;