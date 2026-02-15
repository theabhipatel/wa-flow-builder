import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";

import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import NodeEditorPanel from "../components/NodeEditorPanel";
import CustomEdge from "../components/CustomEdge";
import StartNode from "../nodes/StartNode";
import SubflowStartNode from "../nodes/SubflowStartNode";
import PlainMessageNode from "../nodes/PlainMessageNode";
import ButtonMessageNode from "../nodes/ButtonMessageNode";
import ListMessageNode from "../nodes/ListMessageNode";
import GotoSubflowNode from "../nodes/GotoSubflowNode";
import { exportFlow, importFlow } from "../utils/flowExportImport";

const nodeTypes = {
  start: StartNode,
  subflowStart: SubflowStartNode,
  plainMessage: PlainMessageNode,
  buttonMessage: ButtonMessageNode,
  listMessage: ListMessageNode,
  gotoSubflow: GotoSubflowNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const API_URL = "http://localhost:5000";

export default function EditorPage() {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [flowName, setFlowName] = useState("");
  const [flowType, setFlowType] = useState<"main" | "subflow">("main");
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  useEffect(() => {
    if (flowId) {
      loadFlow(flowId);
    }
  }, [flowId]);

  const loadFlow = async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/flow/${id}`);
      setNodes(response.data.nodes || []);
      setEdges(response.data.edges || []);
      setFlowName(response.data.name);
      setFlowType(response.data.type);
    } catch (error) {
      console.error("Error loading flow:", error);
      alert("Error loading flow");
    }
  };

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, type: "custom" }, eds)),
    [setEdges],
  );

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    },
    [setEdges],
  );

  const edgesWithActions = edges.map((edge) => ({
    ...edge,
    type: edge.type || "custom",
    data: {
      ...edge.data,
      onDelete: handleDeleteEdge,
    },
  }));

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          message: type === "plainMessage" ? "New message" : "Choose an option",
          ...(type === "buttonMessage" && {
            buttons: [
              { id: "btn_1", title: "Option 1" },
              { id: "btn_2", title: "Option 2" },
            ],
          }),
          ...(type === "listMessage" && {
            buttonText: "View Options",
            listItems: [
              { id: "list_1", title: "Option 1", description: "Description 1" },
              { id: "list_2", title: "Option 2", description: "Description 2" },
            ],
          }),
          ...(type === "gotoSubflow" && {
            targetFlowId: "",
          }),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => {
        const nodeToDuplicate = nds.find((n) => n.id === nodeId);
        if (!nodeToDuplicate) return nds;

        const newNode: Node = {
          ...nodeToDuplicate,
          id: `${nodeToDuplicate.type}-${Date.now()}`,
          position: {
            x: nodeToDuplicate.position.x + 50,
            y: nodeToDuplicate.position.y + 50,
          },
          data: { ...nodeToDuplicate.data },
        };

        return [...nds, newNode];
      });
    },
    [setNodes],
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const nodeType =
        node.type === "start" || node.type === "subflowStart"
          ? "START node"
          : "this node";
      if (window.confirm(`Are you sure you want to delete ${nodeType}?`)) {
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) =>
          eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
        );
        setSelectedNode(null);
      }
    },
    [nodes, setNodes, setEdges],
  );

  const nodesWithActions = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onDuplicate: () => handleDuplicateNode(node.id),
      onDelete: () => handleDeleteNode(node.id),
    },
  }));

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleUpdateNode = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => (node.id === nodeId ? { ...node, data } : node)),
      );
      setSelectedNode(null);
    },
    [setNodes],
  );

  const handleSave = async () => {
    try {
      await axios.post(`${API_URL}/api/flow/save`, {
        flowId,
        name: flowName,
        type: flowType,
        nodes,
        edges,
      });
      alert("Flow saved successfully!");
    } catch (error) {
      alert("Error saving flow");
      console.error(error);
    }
  };

  const handleExport = () => {
    exportFlow(nodes, edges);
  };

  const handleImport = () => {
    importFlow((importedNodes, importedEdges) => {
      setNodes(importedNodes);
      setEdges(importedEdges);
    });
  };

  const handleTest = async () => {
    const phone = prompt(
      "Enter phone number (with country code, e.g., 919999999999):",
    );
    if (!phone) return;

    try {
      await axios.post(`${API_URL}/api/test-run`, { phone });
      alert("Test flow started! Check your WhatsApp.");
    } catch (error) {
      alert("Error running test");
      console.error(error);
    }
  };

  const handleAutoLayout = useCallback(() => {
    const layoutedNodes: Node[] = [];
    const nodeMap = new Map<string, Node>();
    const visited = new Set<string>();

    nodes.forEach((node) => nodeMap.set(node.id, node));

    const startNode = nodes.find(
      (n) => n.type === "start" || n.type === "subflowStart",
    );
    if (!startNode) return;

    const HORIZONTAL_SPACING = 300;
    const VERTICAL_SPACING = 100;
    const START_X = 50;
    const START_Y = 250;

    const queue: Array<{ nodeId: string; x: number; y: number }> = [
      { nodeId: startNode.id, x: START_X, y: START_Y },
    ];

    while (queue.length > 0) {
      const { nodeId, x, y } = queue.shift()!;

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) continue;

      layoutedNodes.push({
        ...node,
        position: { x, y },
      });

      const outgoingEdges = edges.filter((e) => e.source === nodeId);
      const childCount = outgoingEdges.length;

      outgoingEdges.forEach((edge, idx) => {
        if (!visited.has(edge.target)) {
          const offsetY =
            childCount > 1
              ? (idx - (childCount - 1) / 2) * VERTICAL_SPACING
              : 0;
          queue.push({
            nodeId: edge.target,
            x: x + HORIZONTAL_SPACING,
            y: y + offsetY,
          });
        }
      });
    }

    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        layoutedNodes.push(node);
      }
    });

    setNodes(layoutedNodes);
  }, [nodes, edges, setNodes]);

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="h-screen flex flex-col">
      <Topbar
        flowName={flowName}
        onBack={handleBack}
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
        onTest={handleTest}
        onAutoLayout={handleAutoLayout}
      />
      <div className="flex-1 flex">
        <Sidebar flowType={flowType} />
        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={nodesWithActions}
            edges={edgesWithActions}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            connectionLineStyle={{ stroke: "#9333ea", strokeWidth: 2 }}
            defaultEdgeOptions={{
              type: "custom",
              animated: true,
              style: { stroke: "#9333ea", strokeWidth: 2 },
            }}
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
        {selectedNode && (
          <NodeEditorPanel
            selectedNode={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNode}
          />
        )}
      </div>
    </div>
  );
}
