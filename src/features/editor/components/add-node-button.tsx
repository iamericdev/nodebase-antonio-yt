"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { memo } from "react";

export const AddNodeButton = memo(() => {
  return (
    <Button
      size="icon"
      variant="outline"
      className="bg-background"
      onClick={() => {}}
    >
      <PlusIcon className="size-4" />
    </Button>
  );
});

AddNodeButton.displayName = "AddNodeButton";
