import { requireAuth } from "@/features/auth/auth-utils";
import {
  ExecutionsContainer,
  ExecutionsErrorView,
  ExecutionsList,
  ExecutionsLoadingView,
} from "@/features/executions/components/executions";
import { executionsParamsLoader } from "@/features/executions/server/params-loader";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  searchParams: Promise<SearchParams>;
};

const ExecutionsPage = async ({ searchParams }: Props) => {
  await requireAuth();

  const params = await executionsParamsLoader(searchParams);
  prefetchExecutions(params);

  return (
    <HydrateClient>
      <ExecutionsContainer>
        <ErrorBoundary fallback={<ExecutionsErrorView />}>
          <Suspense fallback={<ExecutionsLoadingView />}>
            <ExecutionsList />
          </Suspense>
        </ErrorBoundary>
      </ExecutionsContainer>
    </HydrateClient>
  );
};

export default ExecutionsPage;
