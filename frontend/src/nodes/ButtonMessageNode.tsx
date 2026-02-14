import { Handle, Position } from "reactflow";
import { Copy, Trash2 } from "lucide-react";

export default function ButtonMessageNode({ data, selected }: any) {
  const buttons = data.buttons || [];

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
        className={`shadow-lg rounded-lg bg-white border-2 border-purple-400 min-w-[220px] transition-all ${
          selected ? "ring-4 ring-purple-300 ring-opacity-60" : ""
        }`}
      >
        <Handle type="target" position={Position.Left} />

        <div className="px-4 py-3 border-b border-purple-200">
          <div className="font-semibold text-sm text-gray-700 mb-1">
            Button Message
          </div>
          <div className="text-xs text-gray-600 break-words">
            {data.message || "Click to edit message"}
          </div>
        </div>

        <div className="py-2">
          {buttons.map((btn: any, idx: number) => (
            <div
              key={btn.id}
              className="relative px-4 py-2 hover:bg-purple-50 border-b border-purple-100 last:border-b-0 flex items-center justify-between group"
            >
              <span className="text-xs text-gray-700 font-medium pr-6">
                {btn.title}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={btn.id}
                style={{
                  top: `${((idx + 1) * 100) / (buttons.length + 1)}%`,
                  right: "-6px",
                  background: "#9333ea",
                  width: "12px",
                  height: "12px",
                }}
              />
            </div>
          ))}
        </div>
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
