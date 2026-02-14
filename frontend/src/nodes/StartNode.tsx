import { Handle, Position } from "reactflow";

export default function StartNode() {
  return (
    <div className="px-6 py-4 shadow-lg rounded-lg bg-green-500 border-2 border-green-600 text-white">
      <div className="font-bold text-center">START</div>
      <Handle type="source" position={Position.Right} id="start-output" />
    </div>
  );
}
