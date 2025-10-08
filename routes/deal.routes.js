import express from "express";
import {
  createDeal,
  getAllDeals,
  getDealById,
  getMyDeals,
  updateDeal,
  approveDeal,
  rejectDeal,
  completeDeal,
  deleteDeal,
  getDealStats
} from "../controllers/deal.controller.js";
import { protectRoute, adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

router.use(protectRoute);

// User routes
router.post("/", createDeal);
router.get("/my-deals", getMyDeals);
router.get("/:id", getDealById);
router.put("/:id", updateDeal);
router.delete("/:id", deleteDeal);

// Admin routes
router.get("/admin/all", adminOnly, getAllDeals);
router.get("/admin/stats", adminOnly, getDealStats);
router.put("/admin/:id/approve", adminOnly, approveDeal);
router.put("/admin/:id/reject", adminOnly, rejectDeal);
router.put("/admin/:id/complete", adminOnly, completeDeal);

export default router;