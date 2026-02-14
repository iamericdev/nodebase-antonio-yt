import type { NodeExecutor } from "@/features/executions/types";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

type StripeTriggerNodeData = Record<string, unknown>;

export const stripeTriggerExecutor: NodeExecutor<
  StripeTriggerNodeData
> = async ({ data, nodeId, context, step, publish }) => {
  await publish(
    stripeTriggerChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  try {
    const result = await step.run("stripe-trigger", async () => context);

    await publish(
      stripeTriggerChannel().status({
        nodeId,
        status: "success",
      }),
    );
    return result;
  } catch (error) {
    await publish(
      stripeTriggerChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
