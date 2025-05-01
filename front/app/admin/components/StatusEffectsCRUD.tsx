"use client";

import { useEffect, useState } from "react";

type StatusEffect = {
  xata_id: string;
  name: string;
  description?: string;
  grade?: string;
  "attribute affected"?: string;
};

export default function StatusEffectsCRUD() {
  const [effects, setEffects] = useState<StatusEffect[]>([]);
  const [newEffect, setNewEffect] = useState({
    name: "",
    description: "",
    grade: "",
    "attribute affected": "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEffect, setEditingEffect] = useState<StatusEffect | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/status-effects");
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setEffects(data);
    } catch (error) {
      console.error("Failed to load status effects:", error);
    }
  };

  const handleAdd = async () => {
    if (!newEffect.name) return;
    const res = await fetch("/api/status-effects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEffect),
    });
    if (!res.ok) return console.error("Add failed");
    setNewEffect({ name: "", description: "", grade: "", "attribute affected": "" });
    fetchData();
  };

  const handleUpdate = async () => {
    if (!editingEffect || !editingId) return;
    const res = await fetch(`/api/status-effects/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingEffect),
    });
    if (!res.ok) return console.error("Update failed");
    setEditingId(null);
    setEditingEffect(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/status-effects/${id}`, { method: "DELETE" });
    if (!res.ok) return console.error("Delete failed");
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Status Effects</h2>
      <ul className="space-y-4 mb-6">
        {effects.map((effect) => (
          <li key={effect.xata_id} className="border p-3 rounded">
            {editingId === effect.xata_id ? (
              <div className="space-y-2">
                <input
                  className="w-full border p-2 rounded"
                  value={editingEffect?.name || ""}
                  onChange={(e) =>
                    setEditingEffect({ ...editingEffect!, name: e.target.value })
                  }
                />
                <input
                  className="w-full border p-2 rounded"
                  value={editingEffect?.description || ""}
                  onChange={(e) =>
                    setEditingEffect({ ...editingEffect!, description: e.target.value })
                  }
                />
                <input
                  className="w-full border p-2 rounded"
                  value={editingEffect?.grade || ""}
                  onChange={(e) =>
                    setEditingEffect({ ...editingEffect!, grade: e.target.value })
                  }
                />
                <input
                  className="w-full border p-2 rounded"
                  value={editingEffect?.["attribute affected"] || ""}
                  onChange={(e) =>
                    setEditingEffect({
                      ...editingEffect!,
                      ["attribute affected"]: e.target.value,
                    })
                  }
                />
                <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded">
                  Save
                </button>
              </div>
            ) : (
              <>
                <strong>{effect.name}</strong>
                <p className="text-sm">{effect.description}</p>
                <p className="text-xs text-blue-600">
                  Grade: {effect.grade} | Affects: {effect["attribute affected"]}
                </p>
                <div className="flex gap-4 mt-2">
                  <button
                    className="text-sm text-blue-500"
                    onClick={() => {
                      setEditingId(effect.xata_id);
                      setEditingEffect(effect);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm text-red-500"
                    onClick={() => handleDelete(effect.xata_id)}
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
          value={newEffect.name}
          onChange={(e) => setNewEffect({ ...newEffect, name: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Description"
          value={newEffect.description}
          onChange={(e) => setNewEffect({ ...newEffect, description: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Grade"
          value={newEffect.grade}
          onChange={(e) => setNewEffect({ ...newEffect, grade: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Attribute Affected"
          value={newEffect["attribute affected"]}
          onChange={(e) =>
            setNewEffect({ ...newEffect, "attribute affected": e.target.value })
          }
        />
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Add Effect
        </button>
      </div>
    </div>
  );
}
