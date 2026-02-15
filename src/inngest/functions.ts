import { getExecutor } from "@/features/executions/lib/executor-registry";
import { ExecutionStatus } from "@/generated/prisma/enums";
import db from "@/lib/db";
import { NonRetriableError } from "inngest";
import { anthropicChannel } from "./channels/anthropic";
import { discordChannel } from "./channels/discord";
import { geminiChannel } from "./channels/gemini";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { openaiChannel } from "./channels/openai";
import { slackChannel } from "./channels/slack";
import { inngest } from "./client";
import { topologicalSort } from "./utils";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    onFailure: async ({ event, step }) => {
      await db.execution.update({
        where: {
          inngestEventId: event.data.event.id,
        },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      manualTriggerChannel(),
      httpRequestChannel(),
      googleFormTriggerChannel(),
      geminiChannel(),
      openaiChannel(),
      anthropicChannel(),
      discordChannel(),
      slackChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!inngestEventId || !workflowId) {
      throw new NonRetriableError(
        "No Inngest event ID or workflow ID provided",
      );
    }

    await step.run("create-execution", async () => {
      await db.execution.create({
        data: {
          inngestEventId,
          workflowId,
          status: ExecutionStatus.RUNNING,
        },
      });
    });

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

    const userId = await step.run("find-user-id", async () => {
      const workflow = await db.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
        },
        select: {
          userId: true,
        },
      });
      return workflow.userId;
    });

    // Initialize context with any initial data from the trigger
    let context = event.data.initialData || {};

    // Execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type);
      context = await executor({
        data: node.data as Record<string, unknown>,
        userId,
        nodeId: node.id,
        context,
        step,
        publish,
      });
    }

    await step.run("update-execution", async () => {
      await db.execution.update({
        where: {
          inngestEventId,
        },
        data: {
          status: ExecutionStatus.SUCCESS,
          output: context,
          completedAt: new Date(),
        },
      });
    });

    return { workflowId, result: context };
  },
);
