"use client";

import { useEffect, useState } from "react";

type Article = {
  xata_id: string;
  name: string;
  description?: string;
  link?: string;
  progress?: number;
};

export default function ArticlesCRUD() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [newArticle, setNewArticle] = useState({ name: "", description: "", link: "", progress: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/articles");
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setArticles(data);
    } catch (error) {
      console.error("Failed to load articles:", error);
    }
  };

  const handleAdd = async () => {
    if (!newArticle.name) return;
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newArticle),
    });
    if (!res.ok) return console.error("Add failed");
    setNewArticle({ name: "", description: "", link: "", progress: 0 });
    fetchData();
  };

  const handleUpdate = async () => {
    if (!editingArticle || !editingId) return;
    const res = await fetch(`/api/articles/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingArticle),
    });
    if (!res.ok) return console.error("Update failed");
    setEditingId(null);
    setEditingArticle(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (!res.ok) return console.error("Delete failed");
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Articles</h2>
      <ul className="space-y-4 mb-6">
        {articles.map((article) => (
          <li key={article.xata_id} className="border p-3 rounded">
            {editingId === article.xata_id ? (
              <div className="space-y-2">
                <input className="w-full border p-2 rounded" value={editingArticle?.name || ""} onChange={(e) => setEditingArticle({ ...editingArticle!, name: e.target.value })} />
                <input className="w-full border p-2 rounded" value={editingArticle?.description || ""} onChange={(e) => setEditingArticle({ ...editingArticle!, description: e.target.value })} />
                <input className="w-full border p-2 rounded" value={editingArticle?.link || ""} onChange={(e) => setEditingArticle({ ...editingArticle!, link: e.target.value })} />
                <input type="number" className="w-full border p-2 rounded" value={editingArticle?.progress || 0} onChange={(e) => setEditingArticle({ ...editingArticle!, progress: Number(e.target.value) })} />
                <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
              </div>
            ) : (
              <>
                <strong>{article.name}</strong>
                <p className="text-sm">{article.description}</p>
                <p className="text-xs text-blue-600">Link: {article.link}</p>
                <p className="text-xs text-blue-600">Progress: {article.progress}%</p>
                <div className="flex gap-4 mt-2">
                  <button className="text-sm text-blue-500" onClick={() => { setEditingId(article.xata_id); setEditingArticle(article); }}>Edit</button>
                  <button className="text-sm text-red-500" onClick={() => handleDelete(article.xata_id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <input className="w-full p-2 border rounded" placeholder="Name" value={newArticle.name} onChange={(e) => setNewArticle({ ...newArticle, name: e.target.value })} />
        <input className="w-full p-2 border rounded" placeholder="Description" value={newArticle.description} onChange={(e) => setNewArticle({ ...newArticle, description: e.target.value })} />
        <input className="w-full p-2 border rounded" placeholder="Link" value={newArticle.link} onChange={(e) => setNewArticle({ ...newArticle, link: e.target.value })} />
        <input type="number" className="w-full p-2 border rounded" placeholder="Progress %" value={newArticle.progress} onChange={(e) => setNewArticle({ ...newArticle, progress: Number(e.target.value) })} />
        <button onClick={handleAdd} className="w-full bg-blue-600 text-white py-2 rounded">Add Article</button>
      </div>
    </div>
  );
}
