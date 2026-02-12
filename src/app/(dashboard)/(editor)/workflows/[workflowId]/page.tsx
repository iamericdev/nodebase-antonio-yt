import { requireAuth } from "@/features/auth/auth-utils";
import {
  Editor,
  EditorErrorView,
  EditorLoadingView,
} from "@/features/editor/components/editor";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
interface WorkflowIdPageProps {
  params: Promise<{ workflowId: string }>;
}
const WorkflowIdPage = async ({ params }: WorkflowIdPageProps) => {
  await requireAuth();
  const { workflowId } = await params;
  prefetchWorkflow(workflowId);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EditorErrorView />}>
        <Suspense fallback={<EditorLoadingView />}>
          <EditorHeader workflowId={workflowId} />
          <div className="flex-1">
            <Editor workflowId={workflowId} />
          </div>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default WorkflowIdPage;
