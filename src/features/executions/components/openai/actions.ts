"use server";

import { openaiChannel } from "@/inngest/channels/openai";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type OpenAIToken = Realtime.Token<typeof openaiChannel, ["status"]>;

export const fetchOpenAIRealtimeToken = async (): Promise<OpenAIToken> => {
  const token = await getSubscriptionToken(inngest, {
    channel: openaiChannel(),
    topics: ["status"],
  });
  return token;
};
