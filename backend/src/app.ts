import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import flowRoutes from "./routes/flowRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import testRoutes from "./routes/testRoutes";
import botRoutes from "./routes/botRoutes";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to ensure MongoDB connection before handling requests
// This is crucial for serverless environments where connections are not persistent
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Routes
app.use("/api/bot", botRoutes);
app.use("/api/flow", flowRoutes);
app.use("/webhook", webhookRoutes);
app.use("/api/test-run", testRoutes);

app.get("/", (req, res) => {
  res.json({ message: "WhatsApp Flow Builder API" });
});

app.get("/api", (req, res) => {
  res.json({ message: "WhatsApp Flow Builder API - Running on Vercel" });
});

export default app;
