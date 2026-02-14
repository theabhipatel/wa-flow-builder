import { Handle, Position } from "reactflow";
import { Copy, Trash2 } from "lucide-react";

export default function StartNode({ data, selected }: any) {
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
        className={`px-6 py-4 shadow-lg rounded-lg bg-green-500 border-2 border-green-600 text-white transition-all ${
          selected ? "ring-4 ring-green-300 ring-opacity-60" : ""
        }`}
      >
        <div className="font-bold text-center">START</div>
        <Handle type="source" position={Position.Right} id="start-output" />
      </div>

      {selected && (
        <div className="absolute -top-10 right-0 flex gap-1 bg-white rounded-lg shadow-lg p-1 border border-gray-200">
          <button
            onClick={handleDuplicate}
            className="p-1.5 hover:bg-green-100 rounded transition"
            title="Duplicate"
          >
            <Copy size={16} className="text-green-600" />
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
