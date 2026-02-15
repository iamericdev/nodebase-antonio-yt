import { Connection, Node } from "@/generated/prisma/client";
import { createId } from "@paralleldrive/cuid2";
import toposort from "toposort";
import { inngest } from "./client";

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[],
): Node[] => {
  // If no connections, return nodes as is (they're all independent)
  if (connections.length === 0) {
    return nodes;
  }

  // Create edges array for toposort
  const edges: [string, string][] = connections.map((connection) => [
    connection.fromNodeId,
    connection.toNodeId,
  ]);

  // Add nodes with no connextions as self-edges to ensure they're included in the sort
  const connectedNodeIds = new Set<string>();
  for (const [from, to] of edges) {
    connectedNodeIds.add(from);
    connectedNodeIds.add(to);
  }
  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  // Perform topological sort
  let sortedNodeIds: string[] = [];
  try {
    sortedNodeIds = toposort(edges);
    // Remove duplicates (from self-edges)
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      // This means we cannot create a linear sort, since the data is cyclic
      throw new Error("Cyclical dependencies detected");
    }
    throw error;
  }

  // Map sorted IDs back to node objects
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const sortedNodes = sortedNodeIds
    .map((id) => nodeMap.get(id)!)
    .filter(Boolean);

  return sortedNodes;
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: any;
}) => {
  return inngest.send({
    name: "workflows/execute.workflow",
    data,
    id: createId(),
  });
};
