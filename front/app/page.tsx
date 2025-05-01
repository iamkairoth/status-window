"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { StatDrawer } from "@/components/StatDrawer";
import Experience from "@/components/Experience";
import Project from "@/components/Project";
import Skills from "@/components/Skills";
import StatusEffects from "@/components/StatusEffects";
import Storyline from "@/components/Storyline";

interface Stat {
  name: string;
  value: number;
  breakdown: Record<string, number | string>;
}

const attributes = ["Strength", "Intelligence", "Resilience", "Creativity", "Luck", "Curiosity"];

export default function Home() {
  const [allStats, setAllStats] = useState<Record<string, Stat>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Home useEffect started...");
    const fetchStats = async () => {
      try {
        const baseUrl = window.location.origin; // Should be http://localhost:3000
        console.log("Base URL:", baseUrl);
        console.log("Starting fetch for stats...");
        
        const responses = await Promise.all(
          attributes.map(async (attr) => {
            const url = `/api/stats/${attr.toLowerCase()}`;
            const fullUrl = `${baseUrl}${url}`;
            console.log(`Initiating fetch for ${fullUrl}`);
            try {
              const res = await fetch(fullUrl, {
                cache: "no-store",
                credentials: "same-origin",
                headers: {
                  "Content-Type": "application/json",
                },
              });
              console.log(`Response for ${attr}: status ${res.status} ${res.statusText}`);
              if (!res.ok) {
                throw new Error(`Failed to fetch ${attr}: ${res.status} ${res.statusText}`);
              }
              const data = await res.json();
              console.log(`Data for ${attr}:`, data);
              return data;
            } catch (error) {
              console.error(`Error fetching ${attr}:`, error);
              const errorMessage = error instanceof Error ? error.message : "Unknown error";
              return { name: attr, value: 0, breakdown: { error: `Fetch failed: ${errorMessage}` } };
            }
          })
        );

        const stats: Record<string, Stat> = {};
        attributes.forEach((attr, idx) => {
          stats[attr.toLowerCase()] = responses[idx];
        });

        console.log("Fetched stats:", stats);
        setAllStats(stats);
        setFetchError(null);
      } catch (error) {
        console.error("Global fetch error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown fetch error";
        setFetchError(errorMessage);
      }
      
    };

    console.log("Calling fetchStats...");
    fetchStats().catch((error) => {
      console.error("fetchStats failed:", error);
      const errorMessage = error instanceof Error ? error.message : "fetchStats failed";
      setFetchError(errorMessage);
    });
    
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
                <div className="text-gray-500 text-center">
                  {fetchError ? `Error: ${fetchError}` : `Loading ${attr}...`}
                </div>
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