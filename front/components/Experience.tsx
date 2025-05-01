"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

export default function Experience() {
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    console.log("Fetching /api/experience");
    fetch("/api/experience", { cache: "no-store" })
      .then((res) => {
        console.log("Experience response status:", res.status);
        if (!res.ok) {
          throw new Error(`Failed to fetch experience: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Experience data:", data);
        setProgress(parseFloat(data.progress_percentage)); // Parse string to number
        setLevel(data.current_level);
      })
      .catch((err) => console.error("Error fetching experience:", err));
  }, []);

  return (
    <div className="w-full">
      <div className="text-center mb-2">Level: {level}</div>
      <Progress value={progress} className="w-full" />
      <div className="mt-1 text-center">{progress.toFixed(2)}%</div>
    </div>
  );
}