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

interface Poetry {
  id: string;
  name: string;
  description: string;
  progress: number;
  link?: string;
}

export default function Poetry() {
  const [poetry, setPoetrys] = useState<Poetry[]>([]);

  useEffect(() => {
    console.log("Fetching /api/poetry");
    fetch("/api/poetry", { cache: "no-store" })
      .then((res) => {
        console.log("Poetrys response status:", res.status);
        if (!res.ok) {
          throw new Error(`Failed to fetch poetry: ${res.status}`);
        }
        return res.json();
      })
      .then((data: Poetry[]) => {
        console.log("Poetrys data:", data);
        setPoetrys(data);
      })
      .catch((err) => console.error("Error fetching poetry:", err));
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Poetry</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Poetrys Overview</SheetTitle>
          <SheetDescription>All current poetry and their progress.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[800px] rounded-md border my-4">
          <div className="p-4">
            {poetry.map((article) => (
              <div key={article.id}>
                <h2 className="font-semibold text-lg">{article.name}</h2>
                <p>{article.description}</p>
                {article.link && article.link !== "#" && (
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Poetry →
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
