"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/entity-component";
import type { Execution } from "@/generated/prisma/client";
import { ExecutionStatus } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2Icon, Loader2Icon, XCircleIcon } from "lucide-react";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";

export const ExecutionsList = () => {
  const { data: executions } = useSuspenseExecutions();

  return (
    <EntityList
      items={executions.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionItem execution={execution} />}
      emptyView={<ExecutionsEmptyView />}
    />
  );
};

export const ExecutionsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <>
      <EntityHeader
        title="Executions"
        description="Create and manage your executions"
      />
    </>
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();
  return (
    <EntityPagination
      disabled={executions.isFetching}
      page={params.page}
      totalPages={executions.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const ExecutionsLoadingView = () => {
  return <LoadingView message="Loading executions..." />;
};

export const ExecutionsErrorView = () => {
  return <ErrorView message="Failed to load executions" />;
};

export const ExecutionsEmptyView = () => {
  return (
    <>
      <EmptyView message="You have no executions yet. Get started by running your first workflow." />
    </>
  );
};

const getExecutionStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-600" />;
    case ExecutionStatus.RUNNING:
      return <Loader2Icon className="size-5 text-blue-600 animate-spin" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-600" />;
    default:
      break;
  }
};

const formStatus = (status: ExecutionStatus) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

export const ExecutionItem = ({
  execution,
}: {
  execution: Execution & {
    workflow: {
      id: string;
      name: string;
    };
  };
}) => {
  const duration = execution.completedAt
    ? Math.round(
        (execution.completedAt.getTime() - execution.startedAt.getTime()) /
          1000,
      )
    : null;
  const subtitle = (
    <>
      {execution.workflow.name} &bull; Started{" "}
      {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
      {duration !== null && <> &bull; Completed in {duration}s</>}
    </>
  );

  const statusIcon = getExecutionStatusIcon(execution.status);

  return (
    <EntityItem
      href={`/executions/${execution.id}`}
      title={formStatus(execution.status)}
      subtitle={subtitle}
      image={
        <div className="size-8 flex items-center justify-center">
          {statusIcon}
        </div>
      }
    />
  );
};
