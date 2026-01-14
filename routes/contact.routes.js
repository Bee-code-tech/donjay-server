import express from "express";
import { submitContactForm } from "../controllers/contact.controller.js";

const router = express.Router();

// Contact form route - no authentication required as anyone can contact
router.post("/submit", submitContactForm);

export default router;