"use client";

import { EntityContainer, EntityHeader } from "@/components/entity-component";
import { Input } from "@/components/ui/input";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useCreateWorkflow,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";

export const WorkflowsList = () => {
  const { data: workflows } = useSuspenseWorkflows();
  return (
    <div>
      {workflows.map((workflow) => (
        <div key={workflow.id}>{workflow.name}</div>
      ))}
    </div>
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const router = useRouter();
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();
  const handleCreateWorkflow = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" created successfully`);
        router.push(`/workflows/${data.id}`);
      },
      onError: (error) => {
        toast.error(`Failed to create workflow: ${error.message}`);
        if (handleError(error)) return;
      },
    });
  };
  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreateWorkflow}
        newButtonLabel="New workflow"
        disabled={disabled}
        isCreating={createWorkflow.isPending}
      />
    </>
  );
};

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={
        <>
          <div className="flex items-center gap-x-2 relative">
            <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2" />
            <Input placeholder="Search workflows..." className="w-full pl-8" />
          </div>
        </>
      }
      pagination={<></>}
    >
      {children}
    </EntityContainer>
  );
};
