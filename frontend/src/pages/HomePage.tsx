import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Edit, Copy, Trash2, Workflow } from "lucide-react";

const API_URL = "http://localhost:5000";

interface Flow {
  _id: string;
  flowId: string;
  name: string;
  type: "main" | "subflow";
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFlows();
  }, []);

  const loadFlows = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/flow/all`);
      setFlows(response.data);
    } catch (error) {
      console.error("Error loading flows:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubflow = async () => {
    const name = prompt("Enter subflow name:");
    if (!name) return;

    try {
      await axios.post(`${API_URL}/api/flow/create`, { name });
      loadFlows();
    } catch (error) {
      alert("Error creating subflow");
      console.error(error);
    }
  };

  const handleDuplicate = async (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.post(`${API_URL}/api/flow/duplicate/${flowId}`);
      loadFlows();
    } catch (error) {
      alert("Error duplicating flow");
      console.error(error);
    }
  };

  const handleDelete = async (flowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this flow?")) return;

    try {
      await axios.delete(`${API_URL}/api/flow/${flowId}`);
      loadFlows();
    } catch (error) {
      alert("Error deleting flow");
      console.error(error);
    }
  };

  const handleOpenFlow = (flowId: string) => {
    navigate(`/editor/${flowId}`);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading flows...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              WhatsApp Flow Builder
            </h1>
            <p className="text-gray-600 mt-1">Manage your flows</p>
          </div>
          <button
            onClick={handleCreateSubflow}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Plus size={20} />
            Create Subflow
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flows.map((flow) => (
            <div
              key={flow._id}
              onClick={() => handleOpenFlow(flow.flowId)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition border-2 border-transparent hover:border-purple-400"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${flow.type === "main" ? "bg-green-100" : "bg-blue-100"}`}
                  >
                    <Workflow
                      size={24}
                      className={
                        flow.type === "main"
                          ? "text-green-600"
                          : "text-blue-600"
                      }
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{flow.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${flow.type === "main" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      {flow.type === "main" ? "Main Flow" : "Subflow"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                Updated:{" "}
                {new Date(flow.updatedAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenFlow(flow.flowId)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm"
                >
                  <Edit size={16} />
                  Edit
                </button>
                {flow.type === "subflow" && (
                  <>
                    <button
                      onClick={(e) => handleDuplicate(flow.flowId, e)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                      title="Duplicate"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(flow.flowId, e)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
