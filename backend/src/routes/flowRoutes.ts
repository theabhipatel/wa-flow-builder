import { Router } from "express";
import Flow from "../models/Flow";

const router = Router();

// Save flow
router.post("/save", async (req, res) => {
  try {
    const { nodes, edges } = req.body;

    await Flow.findOneAndUpdate(
      { name: "default" },
      { name: "default", nodes, edges, updatedAt: new Date() },
      { upsert: true }
    );

    res.json({ success: true, message: "Flow saved" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Load flow
router.get("/", async (req, res) => {
  try {
    const flow = await Flow.findOne({ name: "default" });

    if (!flow) {
      return res.json({ nodes: [], edges: [] });
    }

    res.json({ nodes: flow.nodes, edges: flow.edges });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
