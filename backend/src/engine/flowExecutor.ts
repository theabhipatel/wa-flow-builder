import Flow from "../models/Flow";
import Session from "../models/Session";
import { sendTextMessage } from "../whatsapp/sendText";
import { sendButtonMessage } from "../whatsapp/sendButtons";
import { sendListMessage } from "../whatsapp/sendList";

export const startFlow = async (phone: string) => {
  const flow = await Flow.findOne({ name: "default" });
  if (!flow) {
    console.log("No flow found");
    return;
  }

  // Reset session
  await Session.findOneAndUpdate(
    { phone },
    {
      phone,
      currentNodeId: null,
      waitingForButton: false,
      waitingNodeId: undefined,
      updatedAt: new Date(),
    },
    { upsert: true },
  );

  // Find start node
  const startNode = flow.nodes.find((n: any) => n.type === "start");
  if (!startNode) {
    console.log("No start node found");
    return;
  }

  // Find first node connected to start
  const firstEdge = flow.edges.find((e: any) => e.source === startNode.id);
  if (!firstEdge) {
    console.log("No edge from start node");
    return;
  }

  await executeNode(firstEdge.target, phone, flow);
};

export const executeNode = async (
  nodeId: string,
  phone: string,
  flow?: any,
) => {
  if (!flow) {
    flow = await Flow.findOne({ name: "default" });
  }
  if (!flow) return;

  const node = flow.nodes.find((n: any) => n.id === nodeId);
  if (!node) {
    console.log("Node not found:", nodeId);
    return;
  }

  if (node.type === "plainMessage") {
    // Send text message
    await sendTextMessage(phone, node.data.message);

    // Find next node
    const nextEdge = flow.edges.find((e: any) => e.source === nodeId);
    if (nextEdge) {
      // Continue to next node
      await executeNode(nextEdge.target, phone, flow);
    } else {
      console.log("Flow ended");
    }
  } else if (node.type === "buttonMessage") {
    // Send button message
    await sendButtonMessage(phone, node.data.message, node.data.buttons);

    // Save session - wait for button click
    await Session.findOneAndUpdate(
      { phone },
      {
        phone,
        currentNodeId: nodeId,
        waitingForButton: true,
        waitingNodeId: nodeId,
        updatedAt: new Date(),
      },
      { upsert: true },
    );
    console.log("Waiting for button click");
  } else if (node.type === "listMessage") {
    // Send list message
    await sendListMessage(
      phone,
      node.data.message,
      node.data.buttonText || "View Options",
      node.data.listItems,
    );

    // Save session - wait for list selection
    await Session.findOneAndUpdate(
      { phone },
      {
        phone,
        currentNodeId: nodeId,
        waitingForButton: true,
        waitingNodeId: nodeId,
        updatedAt: new Date(),
      },
      { upsert: true },
    );
    console.log("Waiting for list selection");
  }
};

export const handleButtonClick = async (phone: string, buttonId: string) => {
  const session = await Session.findOne({ phone });

  if (!session || !session.waitingForButton || !session.waitingNodeId) {
    console.log("No active session waiting for interaction");
    return;
  }

  const flow = await Flow.findOne({ name: "default" });
  if (!flow) {
    console.error("No flow found");
    return;
  }

  // Find edge with matching sourceHandle
  const nextEdge = flow.edges.find(
    (e: any) =>
      e.source === session.waitingNodeId && e.sourceHandle === buttonId,
  );

  if (nextEdge) {
    // Update session
    await Session.findOneAndUpdate(
      { phone },
      {
        waitingForButton: false,
        waitingNodeId: undefined,
        updatedAt: new Date(),
      },
    );

    // Continue flow
    await executeNode(nextEdge.target, phone, flow);
  } else {
    console.error(`No edge found for interaction: ${buttonId}`);
  }
};
