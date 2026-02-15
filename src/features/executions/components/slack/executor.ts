import type { NodeExecutor } from "@/features/executions/types";
import { slackChannel } from "@/inngest/channels/slack";
import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import ky from "ky";

// Allow handlebars to handle json objects, stringify them
Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

type SlackNodeData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const slackExecutor: NodeExecutor<SlackNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    slackChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Slack node: No variable name configured");
  }

  if (!data.webhookUrl) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Slack node: No webhook URL configured");
  }

  if (!data.content) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Slack node: No content configured");
  }

  let variableName: string;
  let content: string;
  let webhookUrl: string;
  try {
    variableName = Handlebars.compile(data.variableName!)(context);
    webhookUrl = Handlebars.compile(data.webhookUrl)(context);
    const rawContent = Handlebars.compile(data.content)(context);
    content = decode(rawContent);
  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `Slack node: Failed to resolve variableName, webhookUrl and content template: ${error instanceof Error ? error.message : error}`,
    );
  }

  // Validation to prevent duplicate variable names across nodes in a workflow.
  if (context.hasOwnProperty(variableName)) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      "Slack node: Duplicate variable name not allowed",
    );
  }

  try {
    const result = await step.run("slack-webhook", async () => {
      await ky.post(webhookUrl, {
        json: {
          content,
        },
      });

      return {
        ...context,
        [variableName]: {
          slackMessageSent: true,
          message: content,
        },
      };
    });

    await publish(
      slackChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      slackChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
