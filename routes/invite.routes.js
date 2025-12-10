import express from "express";
import { inviteAdmin } from "../controllers/invite.controller.js";
import { protectRoute, adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protectRoute);

// Admin-only routes
router.use(adminOnly);

// Routes
router.post("/", inviteAdmin);

export default router;