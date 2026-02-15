import { Router } from "express";
import { startFlow } from "../engine/flowExecutor";

const router = Router();

// Manual test run
router.post("/", async (req, res) => {
  try {
    const { phone, botId } = req.body;

    if (!phone || !botId) {
      return res.status(400).json({ error: "Phone number and botId required" });
    }

    await startFlow(phone, botId);
    res.json({ success: true, message: "Flow started" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
