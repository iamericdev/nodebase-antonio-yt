import type {
  NodeExecutor,
  WorkflowContext,
} from "@/features/executions/types";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

// Allow handlebars to handle json objects, stringify them
Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);
  return safeString;
});

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

  if (!data.method) {
    throw new NonRetriableError("HTTP Request node: No method configured");
  }

  if (!data.variableName) {
    throw new NonRetriableError(
      "HTTP Request node: No variable name configured",
    );
  }

  // Validation to prevent duplicate variable names across HTTP request nodes in a workflow.
  if (context[data.variableName]) {
    throw new NonRetriableError(
      "HTTP Request node: Duplicate variable name not allowed",
    );
  }

  const result = await step.run("http-request", async () => {
    const variableName = data.variableName!;
    const method = data.method!;
    // https://.../{{variableName.httpResponse.data.id}}
    const endpoint = Handlebars.compile(data.endpoint!)(context); // gets data from context and passes it to the endpoint (templating language)
    const body = data.body;

    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      const resolved = Handlebars.compile(body || "{}")(context);
      JSON.parse(resolved);
      options.body = resolved;
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
