import { Router } from "express";
import Flow from "../models/Flow";

const router = Router();

// Get all flows
router.get("/all", async (req, res) => {
  try {
    const flows = await Flow.find().sort({ type: -1, createdAt: 1 });
    res.json(flows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single flow by flowId
router.get("/:flowId", async (req, res) => {
  try {
    const { flowId } = req.params;
    const flow = await Flow.findOne({ flowId });

    if (!flow) {
      return res.status(404).json({ error: "Flow not found" });
    }

    res.json(flow);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save/Update flow
router.post("/save", async (req, res) => {
  try {
    const { flowId, name, type, nodes, edges } = req.body;

    if (!flowId || !name || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const flow = await Flow.findOneAndUpdate(
      { flowId },
      { flowId, name, type, nodes, edges, updatedAt: new Date() },
      { upsert: true, new: true },
    );

    res.json({ success: true, message: "Flow saved", flow });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new subflow
router.post("/create", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const flowId = `subflow-${Date.now()}`;
    const initialNodes = [
      {
        id: "subflow-start-1",
        type: "subflowStart",
        position: { x: 50, y: 250 },
        data: {},
      },
    ];

    const flow = await Flow.create({
      flowId,
      name,
      type: "subflow",
      nodes: initialNodes,
      edges: [],
    });

    res.json({ success: true, flow });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Duplicate flow
router.post("/duplicate/:flowId", async (req, res) => {
  try {
    const { flowId } = req.params;
    const originalFlow = await Flow.findOne({ flowId });

    if (!originalFlow) {
      return res.status(404).json({ error: "Flow not found" });
    }

    if (originalFlow.type === "main") {
      return res.status(400).json({ error: "Cannot duplicate main flow" });
    }

    const newFlowId = `subflow-${Date.now()}`;
    const newFlow = await Flow.create({
      flowId: newFlowId,
      name: `${originalFlow.name} (Copy)`,
      type: "subflow",
      nodes: originalFlow.nodes,
      edges: originalFlow.edges,
    });

    res.json({ success: true, flow: newFlow });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete flow
router.delete("/:flowId", async (req, res) => {
  try {
    const { flowId } = req.params;
    const flow = await Flow.findOne({ flowId });

    if (!flow) {
      return res.status(404).json({ error: "Flow not found" });
    }

    if (flow.type === "main") {
      return res.status(400).json({ error: "Cannot delete main flow" });
    }

    await Flow.deleteOne({ flowId });
    res.json({ success: true, message: "Flow deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize main flow if not exists
router.post("/init", async (req, res) => {
  try {
    const mainFlow = await Flow.findOne({ flowId: "main" });

    if (!mainFlow) {
      const initialNodes = [
        {
          id: "start-1",
          type: "start",
          position: { x: 50, y: 250 },
          data: {},
        },
      ];

      await Flow.create({
        flowId: "main",
        name: "Main Flow",
        type: "main",
        nodes: initialNodes,
        edges: [],
      });

      res.json({ success: true, message: "Main flow initialized" });
    } else {
      res.json({ success: true, message: "Main flow already exists" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
