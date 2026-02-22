import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  Workflow,
  ArrowLeft,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { API_URL } from "../config/api";

interface Flow {
  _id: string;
  flowId: string;
  name: string;
  type: "main" | "subflow";
  botId: string;
  createdAt: string;
  updatedAt: string;
}

interface BotType {
  botId: string;
  name: string;
  description: string;
  isConnected: boolean;
  whatsappToken?: string;
  whatsappPhoneNumberId?: string;
  whatsappPhoneNumber?: string;
  verifyToken?: string;
}

export default function FlowListPage() {
  const { botId } = useParams<{ botId: string }>();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [bot, setBot] = useState<BotType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [whatsappToken, setWhatsappToken] = useState("");
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState("");
  const [whatsappPhoneNumber, setWhatsappPhoneNumber] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const webhookUrl = `${API_URL}/webhook/${botId}`;

  useEffect(() => {
    if (botId) {
      loadBot();
      loadFlows();
    }
  }, [botId]);

  const loadBot = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/bot/${botId}`);
      setBot(response.data);
      if (response.data.whatsappToken) {
        setWhatsappToken(response.data.whatsappToken);
        setWhatsappPhoneNumberId(response.data.whatsappPhoneNumberId);
        setWhatsappPhoneNumber(response.data.whatsappPhoneNumber);
        setVerifyToken(response.data.verifyToken);
      }
    } catch (error) {
      console.error("Error loading bot:", error);
    }
  };

  const loadFlows = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/flow/all/${botId}`);
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
      await axios.post(`${API_URL}/api/flow/create`, { name, botId });
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
    navigate(`/bot/${botId}/editor/${flowId}`);
  };

  const handleConnect = async () => {
    if (
      !whatsappToken ||
      !whatsappPhoneNumberId ||
      !whatsappPhoneNumber ||
      !verifyToken
    ) {
      alert("All fields are required");
      return;
    }

    try {
      await axios.put(`${API_URL}/api/bot/${botId}/connect`, {
        whatsappToken,
        whatsappPhoneNumberId,
        whatsappPhoneNumber,
        verifyToken,
      });
      setShowConnectDialog(false);
      loadBot();
      alert("Bot connected successfully!");
    } catch (error) {
      alert("Error connecting bot");
      console.error(error);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">{bot?.name}</h1>
            <p className="text-gray-600 mt-1">
              {bot?.description || "Manage flows for this bot"}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-3">
            <button
              onClick={handleCreateSubflow}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus size={20} />
              Create Subflow
            </button>
            <button
              onClick={() => setShowConnectDialog(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                bot?.isConnected
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <LinkIcon size={20} />
              {bot?.isConnected ? "Edit Connection" : "Connect"}
            </button>
          </div>
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

      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connect WhatsApp Bot</DialogTitle>
            <DialogDescription>
              Configure your WhatsApp Business API credentials
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                />
                <button
                  onClick={copyWebhookUrl}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Use this URL in your WhatsApp Business API configuration
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">WhatsApp Token *</Label>
              <input
                id="token"
                type="text"
                value={whatsappToken}
                onChange={(e) => setWhatsappToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Your WhatsApp API token"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumberId">WhatsApp Phone Number ID *</Label>
              <input
                id="phoneNumberId"
                type="text"
                value={whatsappPhoneNumberId}
                onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="123456789012345"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">WhatsApp Phone Number *</Label>
              <input
                id="phoneNumber"
                type="text"
                value={whatsappPhoneNumber}
                onChange={(e) => setWhatsappPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="+1234567890 (for display only)"
              />
              <p className="text-xs text-gray-600">
                This is for identification purposes only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verifyToken">Verify Token *</Label>
              <input
                id="verifyToken"
                type="text"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Your webhook verify token"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowConnectDialog(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              Save Connection
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
