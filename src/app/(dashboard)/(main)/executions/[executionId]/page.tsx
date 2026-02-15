import { requireAuth } from "@/features/auth/auth-utils";
import { ExecutionView } from "@/features/executions/components/execution";
import { prefetchExecution } from "@/features/executions/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ExecutionIdPageProps {
  params: Promise<{ executionId: string }>;
}

const ExecutionIdPage = async ({ params }: ExecutionIdPageProps) => {
  await requireAuth();
  const { executionId } = await params;

  prefetchExecution(executionId);

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-screen w-full flex flex-col gap-y-8 h-full">
        <HydrateClient>
          <ErrorBoundary fallback={<div>error </div>}>
            <Suspense fallback={<div>loading</div>}>
              <ExecutionView executionId={executionId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default ExecutionIdPage;
