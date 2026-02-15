import { Handle, Position } from "reactflow";
import { Copy, Trash2, List } from "lucide-react";

export default function ListMessageNode({ data, selected }: any) {
  const listItems = data.listItems || [];

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
        className={`shadow-lg rounded-lg bg-white border-2 border-green-400 min-w-[220px] transition-all ${
          selected ? "ring-4 ring-green-300 ring-opacity-60" : ""
        }`}
      >
        <Handle type="target" position={Position.Left} />

        <div className="px-4 py-3 border-b border-green-200">
          <div className="font-semibold text-sm text-gray-700 mb-1 flex items-center gap-2">
            <List size={16} />
            List Message
          </div>
          <div className="text-xs text-gray-600 break-words mb-2">
            {data.message || "Click to edit message"}
          </div>
          <div className="text-xs text-gray-500 italic">
            Button: {data.buttonText || "View Options"}
          </div>
        </div>

        <div className="py-2">
          {listItems.map((item: any, idx: number) => (
            <div
              key={item.id}
              className="relative px-4 py-2 hover:bg-green-50 border-b border-green-100 last:border-b-0 flex items-center justify-between group"
            >
              <div className="flex-1 pr-6">
                <span className="text-xs text-gray-700 font-medium block">
                  {item.title}
                </span>
                {item.description && (
                  <span className="text-xs text-gray-500 block truncate">
                    {item.description}
                  </span>
                )}
              </div>
              <Handle
                type="source"
                position={Position.Right}
                id={item.id}
                style={{
                  top: `${((idx + 1) * 100) / (listItems.length + 1)}%`,
                  right: "-6px",
                  background: "#22c55e",
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
