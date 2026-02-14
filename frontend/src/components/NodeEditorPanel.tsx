import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

interface NodeEditorPanelProps {
  selectedNode: any;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
}

export default function NodeEditorPanel({
  selectedNode,
  onClose,
  onUpdate,
}: NodeEditorPanelProps) {
  const [message, setMessage] = useState("");
  const [buttons, setButtons] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (selectedNode) {
      setMessage(selectedNode.data.message || "");
      setButtons(selectedNode.data.buttons || []);
    }
  }, [selectedNode]);

  if (!selectedNode || selectedNode.type === "start") return null;

  const handleSave = () => {
    const updatedData = {
      ...selectedNode.data,
      message,
      ...(selectedNode.type === "buttonMessage" && { buttons }),
    };
    onUpdate(selectedNode.id, updatedData);
  };

  const addButton = () => {
    if (buttons.length < 3) {
      const newId = `btn_${Date.now()}`;
      setButtons([...buttons, { id: newId, title: "New Button" }]);
    }
  };

  const updateButton = (index: number, title: string) => {
    const updated = [...buttons];
    updated[index].title = title;
    setButtons(updated);
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">Edit Node</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter message text..."
          />
        </div>

        {selectedNode.type === "buttonMessage" && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Buttons (max 3)
              </label>
              {buttons.length < 3 && (
                <button
                  onClick={addButton}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                >
                  <Plus size={16} />
                  Add
                </button>
              )}
            </div>
            <div className="space-y-2">
              {buttons.map((btn, idx) => (
                <div key={btn.id} className="flex gap-2">
                  <input
                    type="text"
                    value={btn.title}
                    onChange={(e) => updateButton(idx, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Button text"
                  />
                  <button
                    onClick={() => removeButton(idx)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
