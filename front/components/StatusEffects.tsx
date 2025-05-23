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

interface StatusEffect {
  xata_id: string;
  name: string;
  grade: string;
  description: string;
  attribute_affected: string;
  value: number;
}

export default function StatusEffects() {
  const [statuses, setStatuses] = useState<StatusEffect[]>([]); // ✅ Correctly typed

  useEffect(() => {
    console.log("Fetching /api/status-effects");
    fetch("/api/status-effects", { cache: "no-store" })
      .then((res) => {
        console.log("StatusEffects response status:", res.status);
        if (!res.ok) {
          throw new Error(`Failed to fetch status effects: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("StatusEffects data:", data);
        setStatuses(data);
      })
      .catch((err) => console.error("Error fetching status effects:", err));
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Status Effects</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Status Effects</SheetTitle>
          <SheetDescription>Active status effects influencing your attributes.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[400px] rounded-md border my-4">
          <div className="p-4">
            {statuses.map((status) => (
              <div key={status.xata_id}>
                <h2 className="font-semibold text-lg">{status.name} ({status.grade})</h2>
                <p>{status.description}</p>
                <p className="italic">
                  {status.attribute_affected}: {status.value}
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
