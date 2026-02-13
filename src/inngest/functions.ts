import { getExecutor } from "@/features/executions/lib/executor-registry";
import db from "@/lib/db";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { NonRetriableError } from "inngest";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { inngest } from "./client";
import { topologicalSort } from "./utils";

const google = createGoogleGenerativeAI();

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  {
    event: "workflows/execute.workflow",
    channels: [httpRequestChannel(), manualTriggerChannel()],
  },
  async ({ event, step, publish }) => {
    const workflowId = event.data.workflowId;
    if (!workflowId) {
      throw new NonRetriableError("No workflow ID provided");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await db.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        include: {
          nodes: true,
          connections: true,
        },
      });

      return topologicalSort(workflow.nodes, workflow.connections);
    });

    // Initialize context with any initial data from the trigger
    let context = event.data.initialData || {};

    // Execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
        publish,
      });
    }

    return { workflowId, result: context };
  },
);
