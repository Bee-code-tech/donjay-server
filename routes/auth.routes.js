import express from "express";
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
  signup,
  updatePass,
  verifyOTP,
} from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);

router.put("/reset-password", resetPassword);



router.post("/logout", logout);
router.put("/changePass", protectRoute, updatePass);

export default router;

