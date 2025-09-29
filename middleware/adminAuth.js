import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "Access denied. Invalid token." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(401).json({ error: "Access denied. Invalid token." });
  }
};

export const adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Access denied. Authentication required." });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }

    next();
  } catch (error) {
    console.log("Error in adminOnly middleware: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");

        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Invalid token, but continue without user
        console.log("Invalid token in optionalAuth, continuing without user");
      }
    }

    next();
  } catch (error) {
    console.log("Error in optionalAuth middleware: ", error.message);
    next(); // Continue without authentication
  }
};