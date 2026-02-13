import type {
  NodeExecutor,
  WorkflowContext,
} from "@/features/executions/types";
import { httpRequestChannel } from "@/inngest/channels/http-request";
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
  publish,
}) => {
  await publish(
    httpRequestChannel().status({
      nodeId,
      status: "loading",
    }),
  );
  if (!data.endpoint) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("HTTP Request node: No endpoint configured");
  }

  if (!data.method) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("HTTP Request node: No method configured");
  }

  if (!data.variableName) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      "HTTP Request node: No variable name configured",
    );
  }

  // Validation to prevent duplicate variable names across HTTP request nodes in a workflow.
  if (context.hasOwnProperty(data.variableName)) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      "HTTP Request node: Duplicate variable name not allowed",
    );
  }

  const result = await step.run("http-request", async () => {
    const variableName = data.variableName!;
    const method = data.method!;
    let endpoint: string;
    try {
      // https://.../{{variableName.httpResponse.data.id}}
      endpoint = Handlebars.compile(data.endpoint!)(context); // gets data from context and passes it to the endpoint (templating language)
    } catch (error) {
      await publish(
        httpRequestChannel().status({
          nodeId,
          status: "error",
        }),
      );
      throw new NonRetriableError(
        `HTTP Request node: Failed to resolve endpoint template: ${error instanceof Error ? error.message : error}`,
      );
    }
    const body = data.body;

    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      let resolved: string;
      try {
        resolved = Handlebars.compile(body || "{}")(context);
        JSON.parse(resolved);
      } catch (error) {
        await publish(
          httpRequestChannel().status({
            nodeId,
            status: "error",
          }),
        );
        throw new NonRetriableError(
          `HTTP Request node: Invalid request body template or JSON: ${error instanceof Error ? error.message : error}`,
        );
      }
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

  await publish(
    httpRequestChannel().status({
      nodeId,
      status: "success",
    }),
  );

  return result;
};
