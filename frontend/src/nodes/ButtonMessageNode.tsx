import { Handle, Position } from "reactflow";

export default function ButtonMessageNode({ data }: any) {
  const buttons = data.buttons || [];

  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-purple-400 min-w-[200px]">
      <Handle type="target" position={Position.Top} />
      <div className="font-semibold text-sm text-gray-700 mb-1">
        Button Message
      </div>
      <div className="text-xs text-gray-600 mb-2 break-words">
        {data.message || "Click to edit message"}
      </div>
      <div className="space-y-1">
        {buttons.map((btn: any, idx: number) => (
          <div key={btn.id} className="text-xs bg-purple-100 px-2 py-1 rounded">
            {btn.title}
          </div>
        ))}
      </div>
      {buttons.map((btn: any, idx: number) => (
        <Handle
          key={btn.id}
          type="source"
          position={Position.Bottom}
          id={btn.id}
          style={{ left: `${((idx + 1) * 100) / (buttons.length + 1)}%` }}
        />
      ))}
    </div>
  );
}
