import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Bot, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { API_URL } from "../config/api";

interface BotType {
  _id: string;
  botId: string;
  name: string;
  description: string;
  isConnected: boolean;
  createdAt: string;
}

export default function BotListPage() {
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [newBotDescription, setNewBotDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/bot/all`);
      setBots(response.data);
    } catch (error) {
      console.error("Error loading bots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = async () => {
    if (!newBotName.trim()) {
      alert("Bot name is required");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/bot/create`, {
        name: newBotName,
        description: newBotDescription,
      });
      setShowCreateDialog(false);
      setNewBotName("");
      setNewBotDescription("");
      loadBots();
    } catch (error) {
      alert("Error creating bot");
      console.error(error);
    }
  };

  const handleDeleteBot = async (
    botId: string,
    botName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    if (
      !window.confirm(
        `Are you sure you want to delete "${botName}"?\n\nThis action cannot be undone. All flows and data associated with this bot will be permanently deleted.`,
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/bot/${botId}`);
      loadBots();
    } catch (error) {
      alert("Error deleting bot");
      console.error(error);
    }
  };

  const handleOpenBot = (botId: string) => {
    navigate(`/bot/${botId}/flows`);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading bots...</div>
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
            <p className="text-gray-600 mt-1">Manage your bots</p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Plus size={20} />
            Create Bot
          </button>
        </div>

        {bots.length === 0 ? (
          <div className="text-center py-16">
            <Bot size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No bots yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first bot to get started
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus size={20} />
              Create Bot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <div
                key={bot._id}
                onClick={() => handleOpenBot(bot.botId)}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition border-2 border-transparent hover:border-purple-400"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Bot size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {bot.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          bot.isConnected
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {bot.isConnected ? "Connected" : "Not Connected"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteBot(bot.botId, bot.name, e)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete Bot"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {bot.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {bot.description}
                  </p>
                )}

                <div className="text-xs text-gray-500">
                  Created: {new Date(bot.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Bot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bot Name *</Label>
              <input
                id="name"
                type="text"
                value={newBotName}
                onChange={(e) => setNewBotName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="My WhatsApp Bot"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={newBotDescription}
                onChange={(e) => setNewBotDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Optional description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowCreateDialog(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBot}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
