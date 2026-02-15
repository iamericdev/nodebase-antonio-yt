"use client";

import { GEMINI_CHANNEL_NAME } from "@/inngest/channels/gemini";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchGeminiRealtimeToken } from "./actions";
import {
  AVAILABLE_MODELS,
  GeminiDialog,
  GeminiDialogValuesType,
} from "./dialog";

type GeminiNodeData = {
  variableName?: string;
  credentialId?: string;
  model?: (typeof AVAILABLE_MODELS)[number];
  systemPrompt?: string;
  userPrompt?: string;
};

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GEMINI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGeminiRealtimeToken,
  });

  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: GeminiDialogValuesType) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id
          ? {
              ...node,
              data: {
                ...node.data,
                ...values,
              },
            }
          : node,
      ),
    );
  };

  const nodeData = props.data;
  const description = nodeData.userPrompt
    ? `(${nodeData.variableName || "No name"}) ${nodeData.model || AVAILABLE_MODELS[0]}: ${nodeData.userPrompt.slice(0, 20)}...`
    : "Not configured";

  return (
    <>
      <GeminiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={"/images/gemini.svg"}
        name="Gemini"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  );
});

GeminiNode.displayName = "GeminiNode";
