import { MessageSquare, MessageCircle, List } from "lucide-react";

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
      <h3 className="font-semibold text-gray-700 mb-4">Drag Nodes</h3>
      <div className="space-y-3">
        <div
          className="p-3 bg-blue-100 border-2 border-blue-400 rounded-lg cursor-move hover:bg-blue-200 transition flex items-center gap-2"
          draggable
          onDragStart={(e) => onDragStart(e, "plainMessage")}
        >
          <MessageSquare size={20} />
          <span className="text-sm font-medium">Plain Message</span>
        </div>
        <div
          className="p-3 bg-purple-100 border-2 border-purple-400 rounded-lg cursor-move hover:bg-purple-200 transition flex items-center gap-2"
          draggable
          onDragStart={(e) => onDragStart(e, "buttonMessage")}
        >
          <MessageCircle size={20} />
          <span className="text-sm font-medium">Button Message</span>
        </div>
        <div
          className="p-3 bg-green-100 border-2 border-green-400 rounded-lg cursor-move hover:bg-green-200 transition flex items-center gap-2"
          draggable
          onDragStart={(e) => onDragStart(e, "listMessage")}
        >
          <List size={20} />
          <span className="text-sm font-medium">List Message</span>
        </div>
      </div>
    </div>
  );
}
