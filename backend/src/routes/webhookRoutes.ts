import { Router } from "express";
import { startFlow, handleButtonClick } from "../engine/flowExecutor";

const router = Router();

// Webhook verification
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook receiver
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            for (const message of change.value.messages) {
              const phone = message.from;
              const messageType = message.type;

              // Handle text messages
              if (messageType === "text") {
                const text = message.text.body.toLowerCase().trim();

                if (["hi", "hello", "start"].includes(text)) {
                  console.log(`Starting flow for ${phone}`);
                  await startFlow(phone);
                }
              }

              // Handle button replies
              if (
                messageType === "interactive" &&
                message.interactive.type === "button_reply"
              ) {
                const buttonId = message.interactive.button_reply.id;
                console.log(`Button clicked: ${buttonId} from ${phone}`);
                await handleButtonClick(phone, buttonId);
              }

              // Handle list replies
              if (
                messageType === "interactive" &&
                message.interactive.type === "list_reply"
              ) {
                const listItemId = message.interactive.list_reply.id;
                console.log(`List item selected: ${listItemId} from ${phone}`);
                await handleButtonClick(phone, listItemId);
              }
            }
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
});

export default router;
