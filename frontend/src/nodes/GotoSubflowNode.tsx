import { Handle, Position } from "reactflow";
import { Copy, Trash2, ArrowRight } from "lucide-react";

export default function GotoSubflowNode({ data, selected }: any) {
  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onDuplicate?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onDelete?.();
  };

  return (
    <div className="relative">
      <div
        className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-purple-500 min-w-[200px] transition-all ${
          selected ? "ring-4 ring-purple-300 ring-opacity-60" : ""
        }`}
      >
        <Handle type="target" position={Position.Left} />
        <div className="flex items-center gap-2 mb-1">
          <ArrowRight size={16} className="text-purple-600" />
          <div className="font-semibold text-sm text-gray-700">
            Go to Subflow
          </div>
        </div>
        <div className="text-xs text-gray-600 break-words">
          {data.targetFlowName || "Click to select subflow"}
        </div>
        <Handle type="source" position={Position.Right} />
      </div>

      {selected && (
        <div className="absolute -top-10 right-0 flex gap-1 bg-white rounded-lg shadow-lg p-1 border border-gray-200">
          <button
            onClick={handleDuplicate}
            className="p-1.5 hover:bg-purple-100 rounded transition"
            title="Duplicate"
          >
            <Copy size={16} className="text-purple-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-100 rounded transition"
            title="Delete"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
}
