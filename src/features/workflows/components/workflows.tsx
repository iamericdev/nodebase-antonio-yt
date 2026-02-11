"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-component";
import type { Workflow } from "@/generated/prisma/client";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { formatDistanceToNow } from "date-fns";
import { WorkflowIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEntitySearch } from "../hooks/use-entity-search";
import {
  useCreateWorkflow,
  useDeleteWorkflow,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";
import { useWorkflowsParams } from "../hooks/use-workflows-params";

export const WorkflowsList = () => {
  const { data: workflows } = useSuspenseWorkflows();

  return (
    <EntityList
      items={workflows.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItem workflow={workflow} />}
      emptyView={<WorkflowsEmptyView />}
    />
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
      search={<WorkflowsSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const WorkflowsSearch = () => {
  const [params, setParams] = useWorkflowsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search workflows..."
    />
  );
};

export const WorkflowsPagination = () => {
  const workflows = useSuspenseWorkflows();
  const [params, setParams] = useWorkflowsParams();
  return (
    <EntityPagination
      disabled={workflows.isFetching}
      page={params.page}
      totalPages={workflows.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const WorkflowsLoadingView = () => {
  return <LoadingView message="Loading workflows..." />;
};

export const WorkflowsErrorView = () => {
  return <ErrorView message="Failed to load workflows" />;
};

export const WorkflowsEmptyView = () => {
  const createWorkflow = useCreateWorkflow();
  const router = useRouter();
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
      <EmptyView
        message="You have no workflows yet. Get started by creating your first workflow."
        onNew={handleCreateWorkflow}
      />
    </>
  );
};

export const WorkflowItem = ({ workflow }: { workflow: Workflow }) => {
  const removeWorkflow = useDeleteWorkflow();
  const handleRemoveWorkflow = () => {
    removeWorkflow.mutate(
      { id: workflow.id },
      {
        onSuccess: (data) => {
          toast.success(`Workflow "${data.name}" deleted successfully`);
        },
        onError: (error) => {
          toast.error(`Failed to delete workflow: ${error.message}`);
        },
      },
    );
  };
  return (
    <EntityItem
      href={`/workflows/${workflow.id}`}
      title={workflow.name}
      subtitle={
        <>
          Update {formatDistanceToNow(workflow.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(workflow.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <WorkflowIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemoveWorkflow}
      isRemoving={removeWorkflow.isPending}
      // actions={<WorkflowActions workflow={workflow} />}
    />
  );
};
