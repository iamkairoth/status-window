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

export default function Skills() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    console.log("Fetching /api/skills");
    fetch("/api/skills", { cache: "no-store" })
      .then((res) => {
        console.log("Skills response status:", res.status);
        if (!res.ok) {
          throw new Error(`Failed to fetch skills: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Skills data:", data);
        setSkills(data);
      })
      .catch((err) => console.error("Error fetching skills:", err));
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Skills</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Skills & Talents</SheetTitle>
          <SheetDescription>Overview of your skills and talents</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[400px] rounded-md border my-4">
          <div className="p-4">
            {skills.map((skill) => (
              <div key={skill.xata_id}>
                <h2 className="font-semibold text-lg">{skill.name} ({skill.grade})</h2>
                <p>{skill.description}</p>
                <p className="italic">
                  {skill.attribute_affected}: {skill.value}
                </p>
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