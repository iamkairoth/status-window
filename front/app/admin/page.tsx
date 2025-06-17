"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import StatusEffectsCRUD from "./components/StatusEffectsCRUD";
import CampaignsCRUD from "./components/CampaignsCRUD";
import ProjectsCRUD from "./components/ProjectsCRUD";
import SkillsCRUD from "./components/SkillsCRUD";
import ExperienceCRUD from "./components/ExperienceCRUD";
import AttributesCRUD from "./components/AttributesCRUD";
import ArticlesCRUD from "./components/ArticlesCRUD";
import PoetryCRUD from "./components/PoetryCRUD";

const components = {
  StatusEffects: <StatusEffectsCRUD />,
  Campaigns: <CampaignsCRUD />,
  Projects: <ProjectsCRUD />,
  Skills: <SkillsCRUD />,
  Experience: <ExperienceCRUD />,
  Attributes: <AttributesCRUD />,
  Articles: <ArticlesCRUD />,
  Poetry: <PoetryCRUD />,
};

export default function AdminPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<keyof typeof components>("StatusEffects");

  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-lg font-medium">Access denied. Admins only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Status Window Admin Dashboard</h1>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </header>

      <nav className="flex flex-wrap gap-2 mb-6">
        {Object.keys(components).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as keyof typeof components)}
            className={`px-4 py-2 rounded ${
              activeTab === key ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {key}
          </button>
        ))}
      </nav>

      <div className="bg-white p-4 rounded shadow w-full max-w-4xl mx-auto">
        {components[activeTab]}
      </div>
    </div>
  );
}