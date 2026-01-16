import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  suspendUser,
  deleteUser
} from "../controllers/users.controller.js";
import { protectRoute, adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protectRoute);

// Routes
router.get("/", adminOnly, getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser); // Users can update their own profile, admins can update any profile
router.put("/:id/suspend", adminOnly, suspendUser); // Admin only
router.delete("/:id", adminOnly, deleteUser); // Admin only

export default router;