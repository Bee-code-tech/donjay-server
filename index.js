import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import path from "path";
import connectDB from "./db/connectToMongoDB.js";
import authRoutes from "./routes/auth.routes.js";
import carRoutes from "./routes/car.routes.js";
import messageRoutes from "./routes/message.routes.js";
import dealRoutes from "./routes/deal.routes.js";
import inspectionRoutes from "./routes/inspection.routes.js";
import { app, server } from "./socket/socket.js";

const PORT = process.env.PORT || 5000;
app.use("/uploads", express.static("uploads"));
const __dirname = path.resolve();
dotenv.config();

connectDB();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Configure CORS
const allowedOrigins = [
  "http://localhost:3000", 
  "https://donjayautoswebsite.netlify.app",
  "https://donjaysite.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/inspections", inspectionRoutes);
// Root endpoint
app.use("/", (req, res) =>
  res.status(200).json({ success: true, msg: "Car Listing Server is running" })
);

server.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});
