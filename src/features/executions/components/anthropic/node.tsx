"use client";

import { ANTHROPIC_CHANNEL_NAME } from "@/inngest/channels/anthropic";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchAnthropicRealtimeToken } from "./actions";
import {
  AVAILABLE_MODELS,
  AnthropicDialog,
  AnthropicDialogValuesType,
} from "./dialog";

type AnthropicNodeData = {
  variableName?: string;
  credentialId?: string;
  model?: (typeof AVAILABLE_MODELS)[number];
  systemPrompt?: string;
  userPrompt?: string;
};

type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: ANTHROPIC_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchAnthropicRealtimeToken,
  });

  const { setNodes } = useReactFlow();

  const handleOpenSettings = () => {
    setDialogOpen(true);
  };

  const handleSubmit = (values: AnthropicDialogValuesType) => {
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
      <AnthropicDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={"/images/anthropic.svg"}
        name="Anthropic"
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      />
    </>
  );
});

AnthropicNode.displayName = "AnthropicNode";
