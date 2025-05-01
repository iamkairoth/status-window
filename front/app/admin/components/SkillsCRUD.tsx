"use client";

import { useEffect, useState } from "react";

type Skill = {
  xata_id: string;
  name: string;
  description?: string;
  grade?: string;
  "attribute affected"?: string;
};

export default function SkillsCRUD() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({
    name: "",
    description: "",
    grade: "",
    "attribute affected": "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/skills");
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setSkills(data);
    } catch (error) {
      console.error("Failed to load skills:", error);
    }
  };

  const handleAdd = async () => {
    if (!newSkill.name) return;
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSkill),
    });
    if (!res.ok) return console.error("Add failed");
    setNewSkill({ name: "", description: "", grade: "", "attribute affected": "" });
    fetchData();
  };

  const handleUpdate = async () => {
    if (!editingSkill || !editingId) return;
    const res = await fetch(`/api/skills/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingSkill),
    });
    if (!res.ok) return console.error("Update failed");
    setEditingId(null);
    setEditingSkill(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
    if (!res.ok) return console.error("Delete failed");
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Skills</h2>
      <ul className="space-y-4 mb-6">
        {skills.map((skill) => (
          <li key={skill.xata_id} className="border p-3 rounded">
            {editingId === skill.xata_id ? (
              <div className="space-y-2">
                <input
                  className="w-full border p-2 rounded"
                  value={editingSkill?.name || ""}
                  onChange={(e) =>
                    setEditingSkill({ ...editingSkill!, name: e.target.value })
                  }
                />
                <input
                  className="w-full border p-2 rounded"
                  value={editingSkill?.description || ""}
                  onChange={(e) =>
                    setEditingSkill({
                      ...editingSkill!,
                      description: e.target.value,
                    })
                  }
                />
                <input
                  className="w-full border p-2 rounded"
                  value={editingSkill?.grade || ""}
                  onChange={(e) =>
                    setEditingSkill({ ...editingSkill!, grade: e.target.value })
                  }
                />
                <input
                  className="w-full border p-2 rounded"
                  value={editingSkill?.["attribute affected"] || ""}
                  onChange={(e) =>
                    setEditingSkill({
                      ...editingSkill!,
                      "attribute affected": e.target.value,
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
                <strong>{skill.name}</strong>
                <p className="text-sm">{skill.description}</p>
                <p className="text-xs text-blue-600">Grade: {skill.grade}</p>
                <p className="text-xs text-purple-600">
                  Attribute: {skill["attribute affected"]}
                </p>
                <div className="flex gap-4 mt-2">
                  <button
                    className="text-sm text-blue-500"
                    onClick={() => {
                      setEditingId(skill.xata_id);
                      setEditingSkill(skill);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm text-red-500"
                    onClick={() => handleDelete(skill.xata_id)}
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
          value={newSkill.name}
          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Description"
          value={newSkill.description}
          onChange={(e) =>
            setNewSkill({ ...newSkill, description: e.target.value })
          }
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Grade"
          value={newSkill.grade}
          onChange={(e) =>
            setNewSkill({ ...newSkill, grade: e.target.value })
          }
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Attribute Affected"
          value={newSkill["attribute affected"]}
          onChange={(e) =>
            setNewSkill({ ...newSkill, "attribute affected": e.target.value })
          }
        />
        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Add Skill
        </button>
      </div>
    </div>
  );
}
