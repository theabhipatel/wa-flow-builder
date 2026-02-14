import { Save, Download, Upload, Play, Network } from "lucide-react";

interface TopbarProps {
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onImport: () => void;
  onTest: () => void;
  onAutoLayout: () => void;
}

export default function Topbar({
  onSave,
  onLoad,
  onExport,
  onImport,
  onTest,
  onAutoLayout,
}: TopbarProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-xl font-bold text-gray-800">WhatsApp Flow Builder</h1>
      <div className="flex gap-2">
        <button
          onClick={onAutoLayout}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <Network size={18} />
          Auto Layout
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Save size={18} />
          Save Flow
        </button>
        <button
          onClick={onLoad}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
        >
          <Download size={18} />
          Load Flow
        </button>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Download size={18} />
          Export JSON
        </button>
        <button
          onClick={onImport}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center gap-2"
        >
          <Upload size={18} />
          Import JSON
        </button>
        <button
          onClick={onTest}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
        >
          <Play size={18} />
          Run Test
        </button>
      </div>
    </div>
  );
}
