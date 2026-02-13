import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { FlaskConicalIcon } from "lucide-react";
import { toast } from "sonner";

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const executeWorkflow = useExecuteWorkflow();

  const handleExecuteWorkflow = () => {
    executeWorkflow.mutate(
      { id: workflowId },
      {
        onSuccess: (data) => {
          toast.success(`Workflow "${data.name}" is executing.`);
        },
        onError: (error) => {
          toast.error(`Failed to execute workflow: "${error}"`);
        },
      },
    );
  };

  return (
    <Button
      size="lg"
      disabled={executeWorkflow.isPending}
      onClick={handleExecuteWorkflow}
    >
      <FlaskConicalIcon className="size-4" />
      Execute Workflow
    </Button>
  );
};
