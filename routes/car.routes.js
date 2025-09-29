import express from "express";
import {
  createCar,
  getAllCars,
  getApprovedCars,
  getCarById,
  getMyCars,
  updateCar,
  approveCar,
  rejectCar,
  deleteCar
} from "../controllers/car.controller.js";
import { protectRoute, adminOnly, optionalAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.get("/approved", getApprovedCars); // Get all approved cars (public)
router.get("/:id", optionalAuth, getCarById); // Get single car (optional auth for pending cars)

// Protected routes (authentication required)
router.post("/", protectRoute, createCar); // Create new car
router.get("/user/my-cars", protectRoute, getMyCars); // Get user's own cars
router.put("/:id", protectRoute, updateCar); // Update car (owner only)

// Admin routes
router.get("/admin/all", protectRoute, adminOnly, getAllCars); // Get all cars (admin only)
router.put("/admin/:id/approve", protectRoute, adminOnly, approveCar); // Approve car (admin only)
router.put("/admin/:id/reject", protectRoute, adminOnly, rejectCar); // Reject car (admin only)
router.delete("/:id", protectRoute, deleteCar); // Delete car (admin or owner)

export default router;