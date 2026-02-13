import type {
  NodeExecutor,
  WorkflowContext,
} from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestNodeData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestNodeData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  if (!data.endpoint) {
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }

  if (!data.variableName) {
    throw new NonRetriableError(
      "HTTP Request node: No variable name configured",
    );
  }

  const result = await step.run("http-request", async () => {
    const variableName = data.variableName!;
    const method = data.method || "GET";
    const endpoint = data.endpoint!;
    const body = data.body;

    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      options.body = body;
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    const response = await ky(endpoint, options);
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    return {
      ...context,
      [variableName]: {
        httpResponse: {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
        },
      },
    } as WorkflowContext;
  });

  return result;
};
