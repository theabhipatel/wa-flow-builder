import { Router } from "express";
import Bot from "../models/Bot";
import { startFlow, handleButtonClick } from "../engine/flowExecutor";

const router = Router();

// Webhook verification for specific bot
router.get("/:botId", async (req, res) => {
  try {
    const { botId } = req.params;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const bot = await Bot.findOne({ botId });

    if (!bot) {
      return res.status(404).json({
        error: "Bot not found",
        botId: botId,
      });
    }

    // If no verification parameters, return webhook info
    if (!mode && !token && !challenge) {
      return res.json({
        message: "Webhook endpoint active",
        botId: bot.botId,
        botName: bot.name,
        isConnected: bot.isConnected,
        webhookUrl: `${req.protocol}://${req.get("host")}/webhook/${botId}`,
        note: "This endpoint is for WhatsApp webhook callbacks. Configure it in your WhatsApp Business API settings.",
      });
    }

    // WhatsApp verification
    if (mode === "subscribe" && token === bot.verifyToken) {
      console.log(`Webhook verified for bot: ${bot.name}`);
      res.status(200).send(challenge);
    } else {
      res.status(403).json({
        error: "Verification failed",
        message: "Invalid verify token or mode",
      });
    }
  } catch (error) {
    console.error("Webhook verification error:", error);
    res.sendStatus(500);
  }
});

// Webhook receiver for specific bot
router.post("/:botId", async (req, res) => {
  try {
    const { botId } = req.params;
    const body = req.body;

    console.log("=== WEBHOOK RECEIVED ===");
    console.log("Bot ID:", botId);

    const bot = await Bot.findOne({ botId });

    if (!bot) {
      console.error("❌ Bot not found:", botId);
      return res.sendStatus(404);
    }

    console.log("✅ Bot found:", bot.name);

    if (body.object === "whatsapp_business_account") {
      console.log("✅ Valid WhatsApp webhook object");

      for (const entry of body.entry) {
        console.log("Processing entry:", entry.id);

        for (const change of entry.changes) {
          console.log("Processing change:", change.field);

          if (change.value.messages) {
            console.log("✅ Messages found:", change.value.messages.length);

            for (const message of change.value.messages) {
              const phone = message.from;
              const messageType = message.type;

              console.log(`📱 Message from: ${phone}, type: ${messageType}`);

              // Handle text messages
              if (messageType === "text") {
                const text = message.text.body.toLowerCase().trim();
                console.log(`📝 Text message: "${text}"`);

                if (["hi", "hello", "start"].includes(text)) {
                  console.log(
                    `🚀 Starting flow for ${phone} on bot ${bot.name}`,
                  );
                  await startFlow(phone, botId);
                } else {
                  console.log(`ℹ️ Text "${text}" does not trigger flow start`);
                }
              }

              // Handle button replies
              if (
                messageType === "interactive" &&
                message.interactive.type === "button_reply"
              ) {
                const buttonId = message.interactive.button_reply.id;
                console.log(
                  `🔘 Button clicked: ${buttonId} from ${phone} on bot ${bot.name}`,
                );
                await handleButtonClick(phone, buttonId, botId);
              }

              // Handle list replies
              if (
                messageType === "interactive" &&
                message.interactive.type === "list_reply"
              ) {
                const listItemId = message.interactive.list_reply.id;
                console.log(
                  `📋 List item selected: ${listItemId} from ${phone} on bot ${bot.name}`,
                );
                await handleButtonClick(phone, listItemId, botId);
              }
            }
          } else {
            console.log("ℹ️ No messages in this change");
          }
        }
      }
    } else {
      console.log("⚠️ Not a whatsapp_business_account object:", body.object);
    }

    console.log("=== WEBHOOK PROCESSED ===");
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.sendStatus(500);
  }
});

export default router;
