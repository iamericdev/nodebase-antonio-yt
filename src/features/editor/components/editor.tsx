"use client";

import { ErrorView, LoadingView } from "@/components/entity-component";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

interface EditorProps {
  workflowId: string;
}
export const Editor = ({ workflowId }: EditorProps) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);
  return <div>{workflow?.name}</div>;
};

export const EditorLoadingView = () => {
  return <LoadingView message="Loading editor ..." />;
};

export const EditorErrorView = () => {
  return <ErrorView message="Failed to load editor" />;
};
