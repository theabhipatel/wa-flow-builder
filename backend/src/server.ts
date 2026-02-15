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
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/bot", botRoutes);
app.use("/api/flow", flowRoutes);
app.use("/webhook", webhookRoutes);
app.use("/api/test-run", testRoutes);

app.get("/", (req, res) => {
  res.json({ message: "WhatsApp Flow Builder API" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
