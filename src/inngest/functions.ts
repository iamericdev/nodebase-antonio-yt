import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { inngest } from "./client";

const google = createGoogleGenerativeAI();

export const helloWorld = inngest.createFunction(
  { id: "excecute" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    const { steps } = await step.ai.wrap("gemin-generate-text", generateText, {
      model: google("gemini-2.0-flash"),
      system: "You are a helpful assistant.",
      messages: [{ role: "user", content: event.data }],
    });

    return steps;
  },
);
