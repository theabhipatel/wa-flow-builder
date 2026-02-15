import { Router } from "express";
import Bot from "../models/Bot";
import Flow from "../models/Flow";
import Session from "../models/Session";

const router = Router();

// Get all bots
router.get("/all", async (req, res) => {
  try {
    const bots = await Bot.find().sort({ createdAt: -1 });
    res.json(bots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single bot
router.get("/:botId", async (req, res) => {
  try {
    const { botId } = req.params;
    const bot = await Bot.findOne({ botId });

    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }

    res.json(bot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new bot
router.post("/create", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const botId = `bot-${Date.now()}`;

    const bot = await Bot.create({
      botId,
      name,
      description: description || "",
      isConnected: false,
    });

    // Create default main flow for this bot
    const initialNodes = [
      {
        id: "start-1",
        type: "start",
        position: { x: 50, y: 250 },
        data: {},
      },
    ];

    await Flow.create({
      flowId: `${botId}-main`,
      name: "Main Flow",
      type: "main",
      botId,
      nodes: initialNodes,
      edges: [],
    });

    res.json({ success: true, bot });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update bot connection details
router.put("/:botId/connect", async (req, res) => {
  try {
    const { botId } = req.params;
    const {
      whatsappToken,
      whatsappPhoneNumberId,
      whatsappPhoneNumber,
      verifyToken,
    } = req.body;

    if (
      !whatsappToken ||
      !whatsappPhoneNumberId ||
      !whatsappPhoneNumber ||
      !verifyToken
    ) {
      return res
        .status(400)
        .json({ error: "All connection fields are required" });
    }

    const bot = await Bot.findOneAndUpdate(
      { botId },
      {
        whatsappToken,
        whatsappPhoneNumberId,
        whatsappPhoneNumber,
        verifyToken,
        isConnected: true,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }

    res.json({ success: true, bot });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete bot
router.delete("/:botId", async (req, res) => {
  try {
    const { botId } = req.params;
    const bot = await Bot.findOne({ botId });

    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }

    // Delete all flows associated with this bot
    await Flow.deleteMany({ botId });

    // Delete all sessions associated with this bot
    await Session.deleteMany({ botId });

    // Delete the bot
    await Bot.deleteOne({ botId });

    res.json({ success: true, message: "Bot and all associated data deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
