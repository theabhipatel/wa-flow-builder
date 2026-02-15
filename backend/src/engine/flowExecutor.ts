import Flow from "../models/Flow";
import Session from "../models/Session";
import { sendTextMessage } from "../whatsapp/sendText";
import { sendButtonMessage } from "../whatsapp/sendButtons";
import { sendListMessage } from "../whatsapp/sendList";

export const startFlow = async (phone: string) => {
  // Try to find main flow (new format) or default flow (old format)
  let flow = await Flow.findOne({ flowId: "main" });
  if (!flow) {
    flow = await Flow.findOne({ name: "default" });
  }
  if (!flow) {
    console.log("No main flow found");
    return;
  }

  // Reset session
  await Session.findOneAndUpdate(
    { phone },
    {
      phone,
      currentFlowId: "main",
      currentNodeId: null,
      waitingForButton: false,
      waitingNodeId: undefined,
      callStack: [],
      variables: {},
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

  await executeNode(firstEdge.target, phone, "main");
};

export const executeNode = async (
  nodeId: string,
  phone: string,
  flowId: string,
) => {
  // Try to find by flowId (new format) or name (old format)
  let flow = await Flow.findOne({ flowId });
  if (!flow && flowId === "main") {
    flow = await Flow.findOne({ name: "default" });
  }
  if (!flow) {
    console.log("Flow not found:", flowId);
    return;
  }

  const node = flow.nodes.find((n: any) => n.id === nodeId);
  if (!node) {
    console.log("Node not found:", nodeId);
    return;
  }

  const session = await Session.findOne({ phone });

  if (node.type === "plainMessage") {
    // Send text message
    await sendTextMessage(phone, node.data.message);

    // Find next node
    const nextEdge = flow.edges.find((e: any) => e.source === nodeId);
    if (nextEdge) {
      // Continue to next node
      await executeNode(nextEdge.target, phone, flowId);
    } else {
      // Flow ended - check if we need to return to caller
      await handleFlowEnd(phone, flowId);
    }
  } else if (node.type === "buttonMessage") {
    // Validate buttons before sending
    const validButtons =
      node.data.buttons?.filter(
        (btn: any) =>
          btn.title && btn.title.trim().length > 0 && btn.title.length <= 20,
      ) || [];

    if (validButtons.length === 0) {
      console.error("No valid buttons found, skipping to next node");
      const nextEdge = flow.edges.find((e: any) => e.source === nodeId);
      if (nextEdge) {
        await executeNode(nextEdge.target, phone, flowId);
      } else {
        await handleFlowEnd(phone, flowId);
      }
      return;
    }

    // Send button message
    await sendButtonMessage(phone, node.data.message, validButtons);

    // Save session - wait for button click
    await Session.findOneAndUpdate(
      { phone },
      {
        phone,
        currentFlowId: flowId,
        currentNodeId: nodeId,
        waitingForButton: true,
        waitingNodeId: nodeId,
        updatedAt: new Date(),
      },
      { upsert: true },
    );
    console.log("Waiting for button click");
  } else if (node.type === "listMessage") {
    // Validate list items
    const validListItems =
      node.data.listItems?.filter(
        (item: any) =>
          item.title && item.title.trim().length > 0 && item.title.length <= 24,
      ) || [];

    if (validListItems.length === 0) {
      console.error("No valid list items found, skipping to next node");
      const nextEdge = flow.edges.find((e: any) => e.source === nodeId);
      if (nextEdge) {
        await executeNode(nextEdge.target, phone, flowId);
      } else {
        await handleFlowEnd(phone, flowId);
      }
      return;
    }

    // Send list message
    await sendListMessage(
      phone,
      node.data.message,
      node.data.buttonText || "View Options",
      validListItems,
    );

    // Save session - wait for list selection
    await Session.findOneAndUpdate(
      { phone },
      {
        phone,
        currentFlowId: flowId,
        currentNodeId: nodeId,
        waitingForButton: true,
        waitingNodeId: nodeId,
        updatedAt: new Date(),
      },
      { upsert: true },
    );
    console.log("Waiting for list selection");
  } else if (node.type === "gotoSubflow") {
    // Handle subflow call
    const targetFlowId = node.data.targetFlowId;
    if (!targetFlowId) {
      console.log("No target flow specified");
      return;
    }

    const targetFlow = await Flow.findOne({ flowId: targetFlowId });
    if (!targetFlow) {
      console.log("Target flow not found:", targetFlowId);
      return;
    }

    // Push current position to call stack
    const nextEdge = flow.edges.find((e: any) => e.source === nodeId);
    if (nextEdge) {
      await Session.findOneAndUpdate(
        { phone },
        {
          $push: {
            callStack: {
              flowId: flowId,
              nodeId: nextEdge.target,
            },
          },
        },
      );
    }

    // Find subflow start node
    const subflowStart = targetFlow.nodes.find(
      (n: any) => n.type === "subflowStart",
    );
    if (!subflowStart) {
      console.log("No subflow start node found");
      return;
    }

    // Find first node after subflow start
    const firstEdge = targetFlow.edges.find(
      (e: any) => e.source === subflowStart.id,
    );
    if (!firstEdge) {
      console.log("No edge from subflow start");
      return;
    }

    // Execute subflow
    await executeNode(firstEdge.target, phone, targetFlowId);
  }
};

const handleFlowEnd = async (phone: string, flowId: string) => {
  const session = await Session.findOne({ phone });
  if (!session || session.callStack.length === 0) {
    console.log("Flow ended");
    return;
  }

  // Pop from call stack
  const returnPoint = session.callStack[session.callStack.length - 1];
  await Session.findOneAndUpdate(
    { phone },
    {
      $pop: { callStack: 1 },
      currentFlowId: returnPoint.flowId,
    },
  );

  // Continue from return point
  await executeNode(returnPoint.nodeId, phone, returnPoint.flowId);
};

export const handleButtonClick = async (phone: string, buttonId: string) => {
  const session = await Session.findOne({ phone });

  if (!session || !session.waitingForButton || !session.waitingNodeId) {
    console.log("No active session waiting for interaction");
    return;
  }

  // Try to find by flowId (new format) or name (old format)
  let flow = await Flow.findOne({ flowId: session.currentFlowId });
  if (!flow && session.currentFlowId === "main") {
    flow = await Flow.findOne({ name: "default" });
  }
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
    await executeNode(nextEdge.target, phone, session.currentFlowId);
  } else {
    console.error(`No edge found for interaction: ${buttonId}`);
  }
};
