import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:5000";

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
  const [buttonText, setButtonText] = useState("");
  const [listItems, setListItems] = useState<
    { id: string; title: string; description?: string }[]
  >([]);
  const [targetFlowId, setTargetFlowId] = useState("");
  const [availableFlows, setAvailableFlows] = useState<any[]>([]);

  useEffect(() => {
    if (selectedNode) {
      setMessage(selectedNode.data.message || "");
      setButtons(selectedNode.data.buttons || []);
      setButtonText(selectedNode.data.buttonText || "");
      setListItems(selectedNode.data.listItems || []);
      setTargetFlowId(selectedNode.data.targetFlowId || "");

      if (selectedNode.type === "gotoSubflow") {
        loadAvailableFlows();
      }
    }
  }, [selectedNode]);

  const loadAvailableFlows = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/flow/all`);
      const subflows = response.data.filter((f: any) => f.type === "subflow");
      setAvailableFlows(subflows);
    } catch (error) {
      console.error("Error loading flows:", error);
    }
  };

  if (
    !selectedNode ||
    selectedNode.type === "start" ||
    selectedNode.type === "subflowStart"
  )
    return null;

  const handleSave = () => {
    const selectedFlow = availableFlows.find((f) => f.flowId === targetFlowId);
    const updatedData = {
      ...selectedNode.data,
      message,
      ...(selectedNode.type === "buttonMessage" && { buttons }),
      ...(selectedNode.type === "listMessage" && { buttonText, listItems }),
      ...(selectedNode.type === "gotoSubflow" && {
        targetFlowId,
        targetFlowName: selectedFlow?.name || "",
      }),
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

  const addListItem = () => {
    if (listItems.length < 10) {
      const newId = `list_${Date.now()}`;
      setListItems([
        ...listItems,
        { id: newId, title: "New Option", description: "" },
      ]);
    }
  };

  const updateListItem = (index: number, field: string, value: string) => {
    const updated = [...listItems];
    updated[index] = { ...updated[index], [field]: value };
    setListItems(updated);
  };

  const removeListItem = (index: number) => {
    setListItems(listItems.filter((_, i) => i !== index));
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
        {selectedNode.type === "gotoSubflow" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Subflow
            </label>
            <select
              value={targetFlowId}
              onChange={(e) => setTargetFlowId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Select Subflow --</option>
              {availableFlows.map((flow) => (
                <option key={flow.flowId} value={flow.flowId}>
                  {flow.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
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
        )}

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

        {selectedNode.type === "listMessage" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="View Options"
                maxLength={20}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  List Items (max 10)
                </label>
                {listItems.length < 10 && (
                  <button
                    onClick={addListItem}
                    className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {listItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-2"
                  >
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          updateListItem(idx, "title", e.target.value)
                        }
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Title (max 24 chars)"
                        maxLength={24}
                      />
                      <button
                        onClick={() => removeListItem(idx)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.description || ""}
                      onChange={(e) =>
                        updateListItem(idx, "description", e.target.value)
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Description (optional, max 72 chars)"
                      maxLength={72}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
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
