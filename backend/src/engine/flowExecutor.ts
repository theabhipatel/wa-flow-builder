import Flow from "../models/Flow";
import Session from "../models/Session";
import Bot from "../models/Bot";
import { sendTextMessage } from "../whatsapp/sendText";
import { sendButtonMessage } from "../whatsapp/sendButtons";
import { sendListMessage } from "../whatsapp/sendList";

export const startFlow = async (phone: string, botId: string) => {
  console.log(`\n🎬 ===== START FLOW =====`);
  console.log(`📱 Phone: ${phone}`);
  console.log(`🤖 BotId: ${botId}`);

  // Find main flow for this bot
  const flow = await Flow.findOne({ flowId: `${botId}-main`, botId });

  if (!flow) {
    console.log("❌ No main flow found for bot:", botId);
    return;
  }

  console.log(`✅ Main flow found: ${flow.name}`);

  // Reset session
  await Session.findOneAndUpdate(
    { phone, botId },
    {
      phone,
      botId,
      currentFlowId: `${botId}-main`,
      currentNodeId: null,
      waitingForButton: false,
      waitingNodeId: undefined,
      callStack: [],
      variables: {},
      updatedAt: new Date(),
    },
    { upsert: true },
  );

  console.log(`✅ Session reset`);

  // Find start node
  const startNode = flow.nodes.find((n: any) => n.type === "start");
  if (!startNode) {
    console.log("❌ No start node found");
    return;
  }

  console.log(`✅ Start node found: ${startNode.id}`);

  // Find first node connected to start
  const firstEdge = flow.edges.find((e: any) => e.source === startNode.id);
  if (!firstEdge) {
    console.log("❌ No edge from start node");
    return;
  }

  console.log(`✅ First edge target: ${firstEdge.target}`);

  await executeNode(firstEdge.target, phone, `${botId}-main`, botId);
};

export const executeNode = async (
  nodeId: string,
  phone: string,
  flowId: string,
  botId: string,
) => {
  console.log(`\n⚙️ ===== EXECUTE NODE =====`);
  console.log(`🆔 NodeId: ${nodeId}`);
  console.log(`📊 FlowId: ${flowId}`);

  const flow = await Flow.findOne({ flowId, botId });

  if (!flow) {
    console.log("❌ Flow not found:", flowId);
    return;
  }

  console.log(`✅ Flow found: ${flow.name}`);

  const node = flow.nodes.find((n: any) => n.id === nodeId);
  if (!node) {
    console.log("❌ Node not found:", nodeId);
    return;
  }

  console.log(`✅ Node type: ${node.type}`);

  if (node.type === "plainMessage") {
    console.log(`📤 Processing plain message node`);
    console.log(`💬 Message: "${node.data.message}"`);

    // Get bot credentials
    const bot = await Bot.findOne({ botId });
    if (!bot || !bot.whatsappToken || !bot.whatsappPhoneNumberId) {
      console.log("❌ Bot credentials not found");
      return;
    }

    console.log(`✅ Bot credentials found for: ${bot.name}`);

    // Send text message
    await sendTextMessage(
      phone,
      node.data.message,
      bot.whatsappToken,
      bot.whatsappPhoneNumberId,
    );

    console.log(`✅ Text message sent successfully`);

    // Find next node
    const nextEdge = flow.edges.find((e: any) => e.source === nodeId);
    if (nextEdge) {
      console.log(`➡️ Moving to next node: ${nextEdge.target}`);
      await executeNode(nextEdge.target, phone, flowId, botId);
    } else {
      console.log(`🏁 No next edge, ending flow`);
      await handleFlowEnd(phone, flowId, botId);
    }
  } else if (node.type === "buttonMessage") {
    console.log(`🔘 Processing button message node`);
    console.log(`💬 Message: "${node.data.message}"`);

    // Get bot credentials
    const bot = await Bot.findOne({ botId });
    if (!bot || !bot.whatsappToken || !bot.whatsappPhoneNumberId) {
      console.log("❌ Bot credentials not found");
      return;
    }

    // Validate buttons before sending
    const validButtons =
      node.data.buttons?.filter(
        (btn: any) =>
          btn.title && btn.title.trim().length > 0 && btn.title.length <= 20,
      ) || [];

    // Check for duplicate button titles
    const uniqueTitles = new Set();
    const uniqueButtons = validButtons.filter((btn: any) => {
      const title = btn.title.trim();
      if (uniqueTitles.has(title)) {
        return false;
      }
      uniqueTitles.add(title);
      return true;
    });

    if (uniqueButtons.length === 0) {
      console.error("❌ No valid buttons found, skipping to next node");
      const nextEdge = flow.edges.find((e: any) => e.source === nodeId);
      if (nextEdge) {
        await executeNode(nextEdge.target, phone, flowId, botId);
      } else {
        await handleFlowEnd(phone, flowId, botId);
      }
      return;
    }

    console.log(`✅ Valid buttons: ${uniqueButtons.length}`);
    uniqueButtons.forEach((btn: any, idx: number) => {
      console.log(`   ${idx + 1}. ${btn.title} (id: ${btn.id})`);
    });

    // Send button message
    await sendButtonMessage(
      phone,
      node.data.message,
      uniqueButtons,
      bot.whatsappToken,
      bot.whatsappPhoneNumberId,
    );

    console.log(`✅ Button message sent successfully`);

    // Save session - wait for button click
    await Session.findOneAndUpdate(
      { phone, botId },
      {
        phone,
        botId,
        currentFlowId: flowId,
        currentNodeId: nodeId,
        waitingForButton: true,
        waitingNodeId: nodeId,
        updatedAt: new Date(),
      },
      { upsert: true },
    );
    console.log(
      `⏳ Waiting for button click on flow: ${flowId}, node: ${nodeId}`,
    );
  } else if (node.type === "listMessage") {
    console.log(`📋 Processing list message node`);
    console.log(`💬 Message: "${node.data.message}"`);

    // Get bot credentials
    const bot = await Bot.findOne({ botId });
    if (!bot || !bot.whatsappToken || !bot.whatsappPhoneNumberId) {
      console.log("❌ Bot credentials not found");
      return;
    }

    // Validate list items
    const validListItems =
      node.data.listItems?.filter(
        (item: any) =>
          item.title && item.title.trim().length > 0 && item.title.length <= 24,
      ) || [];

    if (validListItems.length === 0) {
      console.error("❌ No valid list items found, skipping to next node");
      const nextEdge = flow.edges.find((e: any) => e.source === nodeId);
      if (nextEdge) {
        await executeNode(nextEdge.target, phone, flowId, botId);
      } else {
        await handleFlowEnd(phone, flowId, botId);
      }
      return;
    }

    console.log(`✅ Valid list items: ${validListItems.length}`);

    // Send list message
    await sendListMessage(
      phone,
      node.data.message,
      node.data.buttonText || "View Options",
      validListItems,
      bot.whatsappToken,
      bot.whatsappPhoneNumberId,
    );

    console.log(`✅ List message sent successfully`);

    // Save session - wait for list selection
    await Session.findOneAndUpdate(
      { phone, botId },
      {
        phone,
        botId,
        currentFlowId: flowId,
        currentNodeId: nodeId,
        waitingForButton: true,
        waitingNodeId: nodeId,
        updatedAt: new Date(),
      },
      { upsert: true },
    );
    console.log(`⏳ Waiting for list selection`);
  } else if (node.type === "gotoSubflow") {
    console.log(`🔀 Processing goto subflow node`);

    // Handle subflow call
    const targetFlowId = node.data.targetFlowId;
    if (!targetFlowId) {
      console.log("❌ No target flow specified");
      const nextEdge = flow.edges.find((e: any) => e.source === nodeId);
      if (nextEdge) {
        await executeNode(nextEdge.target, phone, flowId, botId);
      } else {
        await handleFlowEnd(phone, flowId, botId);
      }
      return;
    }

    console.log(`🎯 Target flow: ${targetFlowId}`);

    const targetFlow = await Flow.findOne({ flowId: targetFlowId, botId });
    if (!targetFlow) {
      console.log("❌ Target flow not found:", targetFlowId);
      const nextEdge = flow.edges.find((e: any) => e.source === nodeId);
      if (nextEdge) {
        await executeNode(nextEdge.target, phone, flowId, botId);
      } else {
        await handleFlowEnd(phone, flowId, botId);
      }
      return;
    }

    console.log(`✅ Target flow found: ${targetFlow.name}`);

    // Find first node after subflow start
    const subflowStart = targetFlow.nodes.find(
      (n: any) => n.type === "subflowStart",
    );
    if (!subflowStart) {
      console.log("❌ No subflow start node found");
      return;
    }

    const firstEdge = targetFlow.edges.find(
      (e: any) => e.source === subflowStart.id,
    );
    if (!firstEdge) {
      console.log("❌ No edge from subflow start");
      return;
    }

    // Push current position to call stack BEFORE executing subflow
    const nextEdge = flow.edges.find((e: any) => e.source === nodeId);
    if (nextEdge) {
      const updatedSession = await Session.findOneAndUpdate(
        { phone, botId },
        {
          $push: {
            callStack: {
              flowId: flowId,
              nodeId: nextEdge.target,
            },
          },
          currentFlowId: targetFlowId,
        },
        { new: true },
      );
      console.log(
        `📚 Calling subflow ${targetFlowId}, stack depth: ${updatedSession?.callStack.length}`,
      );
    }

    // Execute subflow
    await executeNode(firstEdge.target, phone, targetFlowId, botId);
  }
};

const handleFlowEnd = async (phone: string, flowId: string, botId: string) => {
  console.log(`\n🏁 ===== FLOW END =====`);
  console.log(`📊 FlowId: ${flowId}`);

  const session = await Session.findOne({ phone, botId });
  if (!session || !session.callStack || session.callStack.length === 0) {
    console.log(`✅ Flow ended: ${flowId}`);
    // Clear session state
    await Session.findOneAndUpdate(
      { phone, botId },
      {
        waitingForButton: false,
        waitingNodeId: undefined,
        currentNodeId: null,
      },
    );
    return;
  }

  // Pop from call stack
  const returnPoint = session.callStack[session.callStack.length - 1];
  console.log(
    `↩️ Returning from ${flowId} to ${returnPoint.flowId}, stack depth: ${session.callStack.length - 1}`,
  );

  await Session.findOneAndUpdate(
    { phone, botId },
    {
      $pop: { callStack: 1 },
      currentFlowId: returnPoint.flowId,
      waitingForButton: false,
      waitingNodeId: undefined,
    },
  );

  // Continue from return point
  await executeNode(returnPoint.nodeId, phone, returnPoint.flowId, botId);
};

export const handleButtonClick = async (
  phone: string,
  buttonId: string,
  botId: string,
) => {
  console.log(`\n🔘 ===== BUTTON CLICK =====`);
  console.log(`📱 Phone: ${phone}`);
  console.log(`🆔 ButtonId: ${buttonId}`);

  const session = await Session.findOne({ phone, botId });

  if (!session || !session.waitingForButton || !session.waitingNodeId) {
    console.log(`❌ No active session waiting for interaction`);
    console.log(`Session state:`, {
      exists: !!session,
      waitingForButton: session?.waitingForButton,
      waitingNodeId: session?.waitingNodeId,
      currentFlowId: session?.currentFlowId,
    });
    return;
  }

  console.log(`✅ Active session found`);
  console.log(`📊 Current flow: ${session.currentFlowId}`);
  console.log(`🆔 Waiting node: ${session.waitingNodeId}`);

  const flow = await Flow.findOne({ flowId: session.currentFlowId, botId });

  if (!flow) {
    console.error("❌ No flow found for flowId:", session.currentFlowId);
    return;
  }

  console.log(`✅ Flow found: ${flow.name}`);

  // Find edge with matching sourceHandle
  const nextEdge = flow.edges.find(
    (e: any) =>
      e.source === session.waitingNodeId && e.sourceHandle === buttonId,
  );

  if (nextEdge) {
    console.log(`✅ Edge found, target: ${nextEdge.target}`);

    // Update session BEFORE continuing execution
    await Session.findOneAndUpdate(
      { phone, botId },
      {
        waitingForButton: false,
        waitingNodeId: undefined,
        currentNodeId: nextEdge.target,
        updatedAt: new Date(),
      },
    );

    console.log(`➡️ Continuing to node: ${nextEdge.target}`);
    // Continue flow
    await executeNode(nextEdge.target, phone, session.currentFlowId, botId);
  } else {
    console.error(
      `❌ No edge found for button: ${buttonId} from node: ${session.waitingNodeId}`,
    );
  }
};
