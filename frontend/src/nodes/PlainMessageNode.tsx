import { Handle, Position } from "reactflow";

export default function PlainMessageNode({ data }: any) {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-blue-400 min-w-[200px]">
      <Handle type="target" position={Position.Left} />
      <div className="font-semibold text-sm text-gray-700 mb-1">
        Plain Message
      </div>
      <div className="text-xs text-gray-600 break-words">
        {data.message || "Click to edit message"}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
