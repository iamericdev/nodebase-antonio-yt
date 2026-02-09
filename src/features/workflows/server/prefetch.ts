import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.workflows.getMany>;

/**
 * Prefetch all workflows
 */
export const prefetchWorkflows = (input: Input) => {
  return prefetch(trpc.workflows.getMany.queryOptions(input));
};
