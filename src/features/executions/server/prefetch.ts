import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.executions.getMany>;

/**
 * Prefetch all executions
 */
export const prefetchExecutions = (input: Input) => {
  return prefetch(trpc.credentials.getMany.queryOptions(input));
};

/**
 * Prefetch a single execution
 */
export const prefetchExecution = (id: string) => {
  return prefetch(trpc.executions.getOne.queryOptions({ id }));
};
