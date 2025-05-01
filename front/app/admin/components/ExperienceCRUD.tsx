"use client";

import { useEffect, useState } from "react";

type Experience = {
  xata_id: string;
  category?: string;
  date?: string;
  description?: string;
  experience?: number;
};

export default function ExperienceCRUD() {
  const [data, setData] = useState<Experience[]>([]);
  const [newEntry, setNewEntry] = useState({
    category: "",
    date: "",
    description: "",
    experience: 0,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Experience | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/experience_log");
      const all = await res.json();
      const sorted = all.sort(
        (a: Experience, b: Experience) =>
          new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
      );
      setData(sorted);
    } catch (err) {
      console.error("Failed to fetch experience data:", err);
    }
  };

  const handleAdd = async () => {
    if (!newEntry.category || !newEntry.date || !newEntry.description) return;
    const res = await fetch("/api/experience_log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntry),
    });
    if (!res.ok) return console.error("Add failed");
    setNewEntry({ category: "", date: "", description: "", experience: 0 });
    fetchData();
  };

  const handleUpdate = async () => {
    if (!selectedId || !editingEntry) return;
    const res = await fetch(`/api/experience_log/${selectedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingEntry),
    });
    if (!res.ok) return console.error("Update failed");
    setSelectedId(null);
    setEditingEntry(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/experience_log/${id}`, { method: "DELETE" });
    if (!res.ok) return console.error("Delete failed");
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const latestFive = data.slice(0, 5);
  const olderEntries = data.slice(5);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Experience Log</h2>

      <div className="space-y-2 mb-6">
        <input
          className="w-full p-2 border rounded"
          placeholder="Category"
          value={newEntry.category}
          onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
        />
        <input
          type="date"
          className="w-full p-2 border rounded"
          value={newEntry.date}
          onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
        />
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Description"
          value={newEntry.description}
          onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
        />
        <input
          type="number"
          className="w-full p-2 border rounded"
          placeholder="Experience Points"
          value={newEntry.experience}
          onChange={(e) => setNewEntry({ ...newEntry, experience: Number(e.target.value) })}
        />
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Add Experience
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-2">Latest 5 Entries</h3>
      <ul className="space-y-3 mb-4">
        {latestFive.map((item) => (
          <li key={item.xata_id} className="border p-3 rounded">
            <strong>{item.category}</strong>
            <p className="text-sm">{item.description}</p>
            <p className="text-xs text-gray-500">Date: {item.date?.split("T")[0]}</p>
            <p className="text-xs text-blue-600">EXP: {item.experience}</p>
            <button
              className="text-red-500 text-xs mt-1"
              onClick={() => handleDelete(item.xata_id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h3 className="text-lg font-semibold mb-2">Edit Older Entry</h3>
      <select
        className="w-full mb-4 p-2 border rounded"
        value={selectedId || ""}
        onChange={(e) => {
          const id = e.target.value;
          setSelectedId(id);
          const found = data.find((d) => d.xata_id === id);
          setEditingEntry(found || null);
        }}
      >
        <option value="">Select an older entry</option>
        {olderEntries.map((item) => (
          <option key={item.xata_id} value={item.xata_id}>
            {item.category} — {item.date?.split("T")[0]}
          </option>
        ))}
      </select>

      {editingEntry && (
        <div className="space-y-2">
          <input
            className="w-full border p-2 rounded"
            placeholder="Category"
            value={editingEntry.category || ""}
            onChange={(e) =>
              setEditingEntry({ ...editingEntry, category: e.target.value })
            }
          />
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={editingEntry.date?.split("T")[0] || ""}
            onChange={(e) =>
              setEditingEntry({ ...editingEntry, date: e.target.value })
            }
          />
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Description"
            value={editingEntry.description || ""}
            onChange={(e) =>
              setEditingEntry({ ...editingEntry, description: e.target.value })
            }
          />
          <input
            type="number"
            className="w-full border p-2 rounded"
            placeholder="Experience Points"
            value={editingEntry.experience || 0}
            onChange={(e) =>
              setEditingEntry({
                ...editingEntry,
                experience: Number(e.target.value),
              })
            }
          />
          <button
            onClick={handleUpdate}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
