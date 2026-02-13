import type { NodeExecutor } from "@/features/executions/types";

type ManualTriggerNodeData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<
  ManualTriggerNodeData
> = async ({ data, nodeId, context, step }) => {
  const result = await step.run("manual-trigger", async () => context);

  return result;
};
