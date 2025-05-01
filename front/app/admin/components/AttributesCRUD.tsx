"use client";

import { useEffect, useState } from "react";

type Attribute = {
  xata_id: string;
  attribute?: string;
  baseline?: number;
  metric?: string;
  notes?: string;
  value?: number;
  weightage?: number;
};

export default function AttributesCRUD() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [filteredAttribute, setFilteredAttribute] = useState<string>("");
  const [newAttr, setNewAttr] = useState({
    attribute: "",
    baseline: 0,
    metric: "",
    notes: "",
    value: 0,
    weightage: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/attributes_log");
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setAttributes(data);
    } catch (error) {
      console.error("Failed to load attributes:", error);
    }
  };

  const handleAdd = async () => {
    if (!newAttr.attribute) return;
    const res = await fetch("/api/attributes_log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAttr),
    });
    if (!res.ok) return console.error("Add failed");
    setNewAttr({
      attribute: "",
      baseline: 0,
      metric: "",
      notes: "",
      value: 0,
      weightage: 0,
    });
    fetchData();
  };

  const handleUpdate = async () => {
    if (!editingAttr || !editingId) return;
    const res = await fetch(`/api/attributes_log/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingAttr),
    });
    if (!res.ok) return console.error("Update failed");
    setEditingId(null);
    setEditingAttr(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/attributes_log/${id}`, { method: "DELETE" });
    if (!res.ok) return console.error("Delete failed");
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uniqueAttributes = Array.from(new Set(attributes.map(a => a.attribute))).filter(Boolean);
  const filteredList = filteredAttribute
    ? attributes.filter(a => a.attribute === filteredAttribute)
    : attributes;

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Attributes Log</h2>

      <select
        className="w-full mb-4 p-2 border rounded"
        value={filteredAttribute}
        onChange={(e) => setFilteredAttribute(e.target.value)}
      >
        <option value="">All Attributes</option>
        {uniqueAttributes.map((attr) => (
          <option key={attr} value={attr}>{attr}</option>
        ))}
      </select>

      <ul className="space-y-4 mb-6">
        {filteredList.map((attr) => (
          <li key={attr.xata_id} className="border p-3 rounded">
            {editingId === attr.xata_id ? (
              <div className="space-y-2">
                <input
                  className="w-full border p-2 rounded"
                  value={editingAttr?.metric || ""}
                  onChange={(e) =>
                    setEditingAttr({ ...editingAttr!, metric: e.target.value })
                  }
                  placeholder="Metric"
                />
                <input
                  className="w-full border p-2 rounded"
                  value={editingAttr?.attribute || ""}
                  onChange={(e) =>
                    setEditingAttr({ ...editingAttr!, attribute: e.target.value })
                  }
                  placeholder="Attribute"
                />
                <input
                  className="w-full border p-2 rounded"
                  type="number"
                  value={editingAttr?.baseline || 0}
                  onChange={(e) =>
                    setEditingAttr({ ...editingAttr!, baseline: Number(e.target.value) })
                  }
                  placeholder="Baseline"
                />
                <input
                  className="w-full border p-2 rounded"
                  value={editingAttr?.notes || ""}
                  onChange={(e) =>
                    setEditingAttr({ ...editingAttr!, notes: e.target.value })
                  }
                  placeholder="Notes"
                />
                <input
                  className="w-full border p-2 rounded"
                  type="number"
                  value={editingAttr?.value || 0}
                  onChange={(e) =>
                    setEditingAttr({ ...editingAttr!, value: Number(e.target.value) })
                  }
                  placeholder="Value"
                />
                <input
                  className="w-full border p-2 rounded"
                  type="number"
                  value={editingAttr?.weightage || 0}
                  onChange={(e) =>
                    setEditingAttr({ ...editingAttr!, weightage: Number(e.target.value) })
                  }
                  placeholder="Weightage"
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
                <p className="text-m text-blue-500">Metric: {attr.metric}</p>
                <p className="text-m text-black-500"> {attr.attribute}</p>
                <p className="text-sm">Value: {attr.value}</p>
                <p className="text-xs">{attr.notes}</p>
                <div className="flex gap-4 mt-2">
                  <button
                    className="text-sm text-blue-500"
                    onClick={() => {
                      setEditingId(attr.xata_id);
                      setEditingAttr(attr);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm text-red-500"
                    onClick={() => handleDelete(attr.xata_id)}
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
          placeholder="Metric"
          value={newAttr.metric}
          onChange={(e) => setNewAttr({ ...newAttr, metric: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Attribute"
          value={newAttr.attribute}
          onChange={(e) => setNewAttr({ ...newAttr, attribute: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          type="number"
          placeholder="Baseline"
          value={newAttr.baseline}
          onChange={(e) => setNewAttr({ ...newAttr, baseline: Number(e.target.value) })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Notes"
          value={newAttr.notes}
          onChange={(e) => setNewAttr({ ...newAttr, notes: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          type="number"
          placeholder="Value"
          value={newAttr.value}
          onChange={(e) => setNewAttr({ ...newAttr, value: Number(e.target.value) })}
        />
        <input
          className="w-full p-2 border rounded"
          type="number"
          placeholder="Weightage"
          value={newAttr.weightage}
          onChange={(e) => setNewAttr({ ...newAttr, weightage: Number(e.target.value) })}
        />
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Add Attribute
        </button>
      </div>
    </div>
  );
}
