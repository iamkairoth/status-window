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

interface Campaign {
  xata_id: string;
  name: string;
  description: string;
  progress: number;
}

export default function Storyline() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]); // ✅ Correctly typed

  useEffect(() => {
    console.log("Fetching /api/campaigns");
    fetch("/api/campaigns", { cache: "no-store" })
      .then((res) => {
        console.log("Campaigns response status:", res.status);
        if (!res.ok) {
          throw new Error(`Failed to fetch campaigns: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Campaigns data:", data);
        setCampaigns(data);
      })
      .catch((err) => console.error("Error fetching campaigns:", err));
  }, []);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Storyline</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Storyline & Campaigns</SheetTitle>
          <SheetDescription>Current storylines and campaigns in progress.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[400px] rounded-md border my-4">
          <div className="p-4">
            {campaigns.map((campaign) => (
              <div key={campaign.xata_id}>
                <h2 className="font-semibold text-lg">{campaign.name}</h2>
                <p>{campaign.description}</p>
                <p className="font-medium">Progress: {campaign.progress}%</p>
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
