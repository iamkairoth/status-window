"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { StatDrawer } from '@/components/StatDrawer';
import Experience from '@/components/Experience';
import Project from '@/components/Project';
import Skills from '@/components/Skills';
import StatusEffects from '@/components/StatusEffects';
import Storyline from '@/components/Storyline';

interface Stat {
  name: string;
  value: number;
  breakdown: Record<string, number | string>;
}

const attributes = ["Strength", "Intelligence", "Resilience", "Creativity", "Luck", "Curiosity"];
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [allStats, setAllStats] = useState<Record<string, Stat>>({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const responses = await Promise.all(
          attributes.map(attr =>
            fetch(`${baseUrl}/stats/${attr.toLowerCase()}/`)
              .then(res => res.json())
              .catch(() => ({ name: attr, value: 0, breakdown: { error: "Fetch failed" } }))
          )
        );

        const stats: Record<string, Stat> = {};
        attributes.forEach((attr, idx) => {
          stats[attr.toLowerCase()] = responses[idx];
        });

        setAllStats(stats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid place-items-center min-h-screen content-center">
      <section className="container mx-auto py-10">
        <Header />
        <div className="flex flex-wrap justify-center mb-6 gap-4">
          {attributes.map((attr) => (
            <div key={attr} className="flex-1 min-w-[100px] max-w-[250px]">
              {allStats[attr.toLowerCase()] ? (
                <StatDrawer statName={attr} statData={allStats[attr.toLowerCase()]} />
              ) : (
                <div className="text-gray-500 text-center">Loading {attr}...</div>
              )}
            </div>
          ))}
        </div>
        <div className="mb-10">
          <Experience />
        </div>
        <div className="flex gap-4 justify-center">
          <Project />
          <Skills />
          <StatusEffects />
          <Storyline />
        </div>
      </section>
    </div>
  );
}
