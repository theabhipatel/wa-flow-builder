import { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";

import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import NodeEditorPanel from "./components/NodeEditorPanel";
import StartNode from "./nodes/StartNode";
import PlainMessageNode from "./nodes/PlainMessageNode";
import ButtonMessageNode from "./nodes/ButtonMessageNode";
import { exportFlow, importFlow } from "./utils/flowExportImport";

const nodeTypes = {
  start: StartNode,
  plainMessage: PlainMessageNode,
  buttonMessage: ButtonMessageNode,
};

const API_URL = "http://localhost:5000";

const initialNodes: Node[] = [
  {
    id: "start-1",
    type: "start",
    position: { x: 250, y: 50 },
    data: {},
  },
];

function FlowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Auto-load flow from database on component mount
  useEffect(() => {
    const loadFlowFromDB = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/flow`);
        if (response.data.nodes && response.data.nodes.length > 0) {
          setNodes(response.data.nodes);
          setEdges(response.data.edges || []);
          console.log("Flow loaded from database");
        }
      } catch (error) {
        console.error("Error auto-loading flow:", error);
      }
    };

    loadFlowFromDB();
  }, []); // Empty dependency array means this runs once on mount

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleUpdateNode = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => (node.id === nodeId ? { ...node, data } : node))
      );
      setSelectedNode(null);
    },
    [setNodes]
  );

  const handleSave = async () => {
    try {
      await axios.post(`${API_URL}/api/flow/save`, { nodes, edges });
      alert("Flow saved successfully!");
    } catch (error) {
      alert("Error saving flow");
      console.error(error);
    }
  };

  const handleLoad = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/flow`);
      if (response.data.nodes && response.data.nodes.length > 0) {
        setNodes(response.data.nodes);
        setEdges(response.data.edges || []);
        alert("Flow loaded successfully!");
      } else {
        alert("No saved flow found in database");
      }
    } catch (error) {
      alert("Error loading flow");
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
      "Enter phone number (with country code, e.g., 919999999999):"
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

  return (
    <div className="h-screen flex flex-col">
      <Topbar
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExport}
        onImport={handleImport}
        onTest={handleTest}
      />
      <div className="flex-1 flex">
        <Sidebar />
        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
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

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  );
}
