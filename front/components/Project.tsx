"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function Project() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    console.log("Fetching /api/projects");
    fetch("/api/projects", { cache: "no-store" })
      .then((res) => {
        console.log("Projects response status:", res.status);
        if (!res.ok) {
          throw new Error(`Failed to fetch projects: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Projects data:", data);
        setProjects(data);
      })
      .catch((err) => console.error("Error fetching projects:", err));
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Projects</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Projects Overview</SheetTitle>
          <SheetDescription>All current projects and their progress.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[800px] rounded-md border my-4">
          <div className="p-4">
            {projects.map((project) => (
              <div key={project.id}>
                <h2 className="font-semibold text-lg">{project.name}</h2>
                <p>{project.description}</p>
                <p className="font-medium">Progress: {project.progress}%</p>
                {project.link && project.link !== "#" && (
                  <a href={project.link} target="_blank" className="text-blue-500 underline">
                    View Project →
                  </a>
                )}
                <Separator className="my-3" />
              </div>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}