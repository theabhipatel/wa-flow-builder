import { Handle, Position } from "reactflow";

export default function ButtonMessageNode({ data }: any) {
  const buttons = data.buttons || [];

  return (
    <div className="shadow-lg rounded-lg bg-white border-2 border-purple-400 min-w-[220px]">
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
  );
}
