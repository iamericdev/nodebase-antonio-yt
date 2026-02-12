"use client";

import type { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { ManualTriggerDialog } from "./dialog";

export const ManualTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeStatus = "success";

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <BaseTriggerNode
        {...props}
        id={props.id}
        icon={MousePointerIcon}
        name="When clicking 'Execute workflow'"
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  );
});

ManualTriggerNode.displayName = "ManualTriggerNode";
