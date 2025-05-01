import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";

interface Stat {
  name: string;
  value: number;
  breakdown: Record<string, number | string>;
}

interface StatDrawerProps {
  statName: string;
  statData: Stat;
}

export function StatDrawer({ statName, statData }: StatDrawerProps) {
  // Handle error state cleanly
  if (!statData || !statData.breakdown || statData.breakdown.error) {
    return (
      <div className="text-red-500 text-center">
        {statName} -- Error: {statData?.breakdown?.error || "No data"}
      </div>
    );
  }

  return (
    <Drawer>
      {/* ✅ DrawerTrigger expects a SINGLE element */}
      <DrawerTrigger asChild>
        {/* ✅ Button becomes that SINGLE element */}
        <Button variant="outline">
          {statName} -- {statData.value}
        </Button>
      </DrawerTrigger>

      {/* ✅ DrawerContent */}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">{statName}</DrawerTitle>
          <DrawerDescription className="text-center">
            Stat Breakdown
          </DrawerDescription>
        </DrawerHeader>

        <div className="text-center p-4 space-y-2">
          {Object.entries(statData.breakdown).map(([metric, score]) => (
            <div key={metric}>
              {metric} -- {typeof score === 'number' ? score.toFixed(2) : score}
            </div>
          ))}
        </div>

        <DrawerFooter>
          {/* ✅ DrawerClose expects a SINGLE element */}
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
