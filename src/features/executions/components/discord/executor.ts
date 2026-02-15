import type { NodeExecutor } from "@/features/executions/types";
import { discordChannel } from "@/inngest/channels/discord";
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

type DiscordNodeData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const discordExecutor: NodeExecutor<DiscordNodeData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    discordChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Discord node: No variable name configured");
  }

  if (!data.webhookUrl) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Discord node: No webhook URL configured");
  }

  if (!data.content) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Discord node: No content configured");
  }

  let variableName: string;
  let content: string;
  let webhookUrl: string;
  let username: string | undefined;
  try {
    variableName = Handlebars.compile(data.variableName!)(context);
    webhookUrl = Handlebars.compile(data.webhookUrl)(context);
    const rawContent = Handlebars.compile(data.content)(context);
    content = decode(rawContent);
    username = data.username
      ? Handlebars.compile(data.username)(context)
      : undefined;
  } catch (error) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `Discord node: Failed to resolve variableName, webhookUrl and content template: ${error instanceof Error ? error.message : error}`,
    );
  }

  // Validation to prevent duplicate variable names across nodes in a workflow.
  if (context.hasOwnProperty(variableName)) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      "Discord node: Duplicate variable name not allowed",
    );
  }

  try {
    const result = await step.run("discord-webhook", async () => {
      const message = content.slice(0, 2000);
      await ky.post(webhookUrl, {
        json: {
          content: message,
          username,
        },
      });

      return {
        ...context,
        [variableName]: {
          discordMessageSent: true,
          message,
        },
      };
    });

    await publish(
      discordChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return result;
  } catch (error) {
    await publish(
      discordChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
