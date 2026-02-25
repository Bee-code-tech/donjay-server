import express from "express";
import {
  bookInspection,
  getAvailableSlots,
  getAllInspections,
  getMyInspections,
  getInspectionById,
  rescheduleInspection,
  confirmInspection,
  completeInspection,
  cancelInspection
} from "../controllers/inspection.controller.js";
import { protectRoute, adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

router.use(protectRoute);

// Customer routes
router.post("/book", bookInspection);
router.get("/slots", getAvailableSlots);
router.get("/available-slots", getAvailableSlots);
router.get("/my-inspections", getMyInspections);
router.put("/:id/reschedule", rescheduleInspection);
router.put("/:id/cancel", cancelInspection);
router.get("/:id", getInspectionById);

// Admin routes
router.get("/admin/all", adminOnly, getAllInspections);
router.put("/admin/:id/confirm", adminOnly, confirmInspection);
router.put("/admin/:id/complete", adminOnly, completeInspection);

export default router;