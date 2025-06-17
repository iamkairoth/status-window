"use client";

import { useEffect, useState } from "react";

type Poetry = {
  xata_id: string;
  name: string;
  description?: string;
  link?: string;
  progress?: number;
};

export default function PoetryCRUD() {
  const [poetry, setPoetry] = useState<Poetry[]>([]);
  const [newPoetry, setNewPoetry] = useState({ name: "", description: "", link: "", progress: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPoetry, setEditingPoetry] = useState<Poetry | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/poetry");
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setPoetry(data);
    } catch (error) {
      console.error("Failed to load poetry:", error);
    }
  };

  const handleAdd = async () => {
    if (!newPoetry.name) return;
    const res = await fetch("/api/poetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPoetry),
    });
    if (!res.ok) return console.error("Add failed");
    setNewPoetry({ name: "", description: "", link: "", progress: 0 });
    fetchData();
  };

  const handleUpdate = async () => {
    if (!editingPoetry || !editingId) return;
    const res = await fetch(`/api/poetry/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingPoetry),
    });
    if (!res.ok) return console.error("Update failed");
    setEditingId(null);
    setEditingPoetry(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/poetry/${id}`, { method: "DELETE" });
    if (!res.ok) return console.error("Delete failed");
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Poetry</h2>
      <ul className="space-y-4 mb-6">
        {poetry.map((poem) => (
          <li key={poem.xata_id} className="border p-3 rounded">
            {editingId === poem.xata_id ? (
              <div className="space-y-2">
                <input className="w-full border p-2 rounded" value={editingPoetry?.name || ""} onChange={(e) => setEditingPoetry({ ...editingPoetry!, name: e.target.value })} />
                <input className="w-full border p-2 rounded" value={editingPoetry?.description || ""} onChange={(e) => setEditingPoetry({ ...editingPoetry!, description: e.target.value })} />
                <input className="w-full border p-2 rounded" value={editingPoetry?.link || ""} onChange={(e) => setEditingPoetry({ ...editingPoetry!, link: e.target.value })} />
                <input type="number" className="w-full border p-2 rounded" value={editingPoetry?.progress || 0} onChange={(e) => setEditingPoetry({ ...editingPoetry!, progress: Number(e.target.value) })} />
                <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
              </div>
            ) : (
              <>
                <strong>{poem.name}</strong>
                <p className="text-sm">{poem.description}</p>
                <p className="text-xs text-blue-600">Link: {poem.link}</p>
                <p className="text-xs text-blue-600">Progress: {poem.progress}%</p>
                <div className="flex gap-4 mt-2">
                  <button className="text-sm text-blue-500" onClick={() => { setEditingId(poem.xata_id); setEditingPoetry(poem); }}>Edit</button>
                  <button className="text-sm text-red-500" onClick={() => handleDelete(poem.xata_id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <input className="w-full p-2 border rounded" placeholder="Name" value={newPoetry.name} onChange={(e) => setNewPoetry({ ...newPoetry, name: e.target.value })} />
        <input className="w-full p-2 border rounded" placeholder="Description" value={newPoetry.description} onChange={(e) => setNewPoetry({ ...newPoetry, description: e.target.value })} />
        <input className="w-full p-2 border rounded" placeholder="Link" value={newPoetry.link} onChange={(e) => setNewPoetry({ ...newPoetry, link: e.target.value })} />
        <input type="number" className="w-full p-2 border rounded" placeholder="Progress %" value={newPoetry.progress} onChange={(e) => setNewPoetry({ ...newPoetry, progress: Number(e.target.value) })} />
        <button onClick={handleAdd} className="w-full bg-blue-600 text-white py-2 rounded">Add Poetry</button>
      </div>
    </div>
  );
}
