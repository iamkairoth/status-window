"use client";

import { useEffect, useState } from "react";

type Project = {
  xata_id: string;
  name: string;
  description?: string;
  link?: string;
  progress?: number;
};

export default function ProjectsCRUD() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState({ name: "", description: "", link: "", progress: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const handleAdd = async () => {
    if (!newProject.name) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    });
    if (!res.ok) return console.error("Add failed");
    setNewProject({ name: "", description: "", link: "", progress: 0 });
    fetchData();
  };

  const handleUpdate = async () => {
    if (!editingProject || !editingId) return;
    const res = await fetch(`/api/projects/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingProject),
    });
    if (!res.ok) return console.error("Update failed");
    setEditingId(null);
    setEditingProject(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (!res.ok) return console.error("Delete failed");
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Projects</h2>
      <ul className="space-y-4 mb-6">
        {projects.map((project) => (
          <li key={project.xata_id} className="border p-3 rounded">
            {editingId === project.xata_id ? (
              <div className="space-y-2">
                <input className="w-full border p-2 rounded" value={editingProject?.name || ""} onChange={(e) => setEditingProject({ ...editingProject!, name: e.target.value })} />
                <input className="w-full border p-2 rounded" value={editingProject?.description || ""} onChange={(e) => setEditingProject({ ...editingProject!, description: e.target.value })} />
                <input className="w-full border p-2 rounded" value={editingProject?.link || ""} onChange={(e) => setEditingProject({ ...editingProject!, link: e.target.value })} />
                <input type="number" className="w-full border p-2 rounded" value={editingProject?.progress || 0} onChange={(e) => setEditingProject({ ...editingProject!, progress: Number(e.target.value) })} />
                <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
              </div>
            ) : (
              <>
                <strong>{project.name}</strong>
                <p className="text-sm">{project.description}</p>
                <p className="text-xs text-blue-600">Link: {project.link}</p>
                <p className="text-xs text-blue-600">Progress: {project.progress}%</p>
                <div className="flex gap-4 mt-2">
                  <button className="text-sm text-blue-500" onClick={() => { setEditingId(project.xata_id); setEditingProject(project); }}>Edit</button>
                  <button className="text-sm text-red-500" onClick={() => handleDelete(project.xata_id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <input className="w-full p-2 border rounded" placeholder="Name" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
        <input className="w-full p-2 border rounded" placeholder="Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
        <input className="w-full p-2 border rounded" placeholder="Link" value={newProject.link} onChange={(e) => setNewProject({ ...newProject, link: e.target.value })} />
        <input type="number" className="w-full p-2 border rounded" placeholder="Progress %" value={newProject.progress} onChange={(e) => setNewProject({ ...newProject, progress: Number(e.target.value) })} />
        <button onClick={handleAdd} className="w-full bg-blue-600 text-white py-2 rounded">Add Project</button>
      </div>
    </div>
  );
}
