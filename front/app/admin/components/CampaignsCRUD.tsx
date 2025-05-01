"use client";

import { useEffect, useState } from "react";

type Campaign = {
  xata_id: string;
  name: string;
  description?: string;
  progress?: number;
};

export default function CampaignsCRUD() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    progress: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/campaigns");
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setCampaigns(data);
    } catch (error) {
      console.error("Failed to load campaigns:", error);
    }
  };

  const handleAdd = async () => {
    if (!newCampaign.name) return;
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCampaign),
    });
    if (!res.ok) return console.error("Add failed");
    setNewCampaign({ name: "", description: "", progress: 0 });
    fetchData();
  };

  const handleUpdate = async () => {
    if (!editingCampaign || !editingId) return;
    const res = await fetch(`/api/campaigns/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingCampaign),
    });
    if (!res.ok) return console.error("Update failed");
    setEditingId(null);
    setEditingCampaign(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    if (!res.ok) return console.error("Delete failed");
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Campaigns</h2>
      <ul className="space-y-4 mb-6">
        {campaigns.map((campaign) => (
          <li key={campaign.xata_id} className="border p-3 rounded">
            {editingId === campaign.xata_id ? (
              <div className="space-y-2">
                <input
                  className="w-full border p-2 rounded"
                  value={editingCampaign?.name || ""}
                  onChange={(e) =>
                    setEditingCampaign({ ...editingCampaign!, name: e.target.value })
                  }
                />
                <input
                  className="w-full border p-2 rounded"
                  value={editingCampaign?.description || ""}
                  onChange={(e) =>
                    setEditingCampaign({
                      ...editingCampaign!,
                      description: e.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  value={editingCampaign?.progress || 0}
                  onChange={(e) =>
                    setEditingCampaign({
                      ...editingCampaign!,
                      progress: Number(e.target.value),
                    })
                  }
                />
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <strong>{campaign.name}</strong>
                <p className="text-sm">{campaign.description}</p>
                <p className="text-xs text-blue-600">Progress: {campaign.progress}%</p>
                <div className="flex gap-4 mt-2">
                  <button
                    className="text-sm text-blue-500"
                    onClick={() => {
                      setEditingId(campaign.xata_id);
                      setEditingCampaign(campaign);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm text-red-500"
                    onClick={() => handleDelete(campaign.xata_id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <input
          className="w-full p-2 border rounded"
          placeholder="Name"
          value={newCampaign.name}
          onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Description"
          value={newCampaign.description}
          onChange={(e) =>
            setNewCampaign({ ...newCampaign, description: e.target.value })
          }
        />
        <input
          type="number"
          className="w-full p-2 border rounded"
          placeholder="Progress %"
          value={newCampaign.progress}
          onChange={(e) =>
            setNewCampaign({ ...newCampaign, progress: Number(e.target.value) })
          }
        />
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Add Campaign
        </button>
      </div>
    </div>
  );
}
