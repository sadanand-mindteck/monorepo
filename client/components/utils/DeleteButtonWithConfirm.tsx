import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"; // ShadCN popover
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

export function DeleteButtonWithConfirm({
  item,
  onConfirm,
  isLoading,
}: {
  item: any;
  onConfirm: (item: any, setOpen: Dispatch<SetStateAction<boolean>>) => void;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="icon"
              variant="outline"
              >
          <Trash color="red" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-4 text-center space-y-2">
        <p className="text-sm">Are you sure?</p>
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            disabled={isLoading}
            variant="destructive"
            onClick={() => {
              onConfirm(item, setOpen);
            }}
          >
            Yes
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            No
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
