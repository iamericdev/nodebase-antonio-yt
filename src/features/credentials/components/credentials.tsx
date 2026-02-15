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
import type { Credential } from "@/generated/prisma/client";
import { CredentialType } from "@/generated/prisma/enums";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useDeleteCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "../hooks/use-entity-search";

export const CredentialsList = () => {
  const { data: credentials } = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItem credential={credential} />}
      emptyView={<CredentialsEmptyView />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <>
      <EntityHeader
        title="Credentials"
        description="Create and manage your credentials"
        newButtonLabel="New credential"
        newButtonHref="/credentials/new"
        disabled={disabled}
      />
    </>
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });
  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials..."
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();
  return (
    <EntityPagination
      disabled={credentials.isFetching}
      page={params.page}
      totalPages={credentials.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const CredentialsLoadingView = () => {
  return <LoadingView message="Loading credentials..." />;
};

export const CredentialsErrorView = () => {
  return <ErrorView message="Failed to load credentials" />;
};

export const CredentialsEmptyView = () => {
  const router = useRouter();
  const handleCreateCredential = () => {
    router.push("/credentials/new");
  };
  return (
    <>
      <EmptyView
        message="You have no credentials yet. Get started by creating your first credential."
        onNew={handleCreateCredential}
      />
    </>
  );
};

const credentialLogos: Record<CredentialType, string> = {
  [CredentialType.GEMINI]: "/images/gemini.svg",
  [CredentialType.OPENAI]: "/images/openai.svg",
  [CredentialType.ANTHROPIC]: "/images/anthropic.svg",
};

export const CredentialItem = ({ credential }: { credential: Credential }) => {
  const removeCredential = useDeleteCredential();
  const handleRemoveCredential = () => {
    removeCredential.mutate(
      { id: credential.id },
      {
        onSuccess: (data) => {
          toast.success(`Credential "${data.name}" deleted successfully`);
        },
        onError: (error) => {
          toast.error(`Failed to delete credential: ${error.message}`);
        },
      },
    );
  };
  return (
    <EntityItem
      href={`/credentials/${credential.id}`}
      title={credential.name}
      subtitle={
        <>
          Update{" "}
          {formatDistanceToNow(credential.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(credential.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <Image
            src={credentialLogos[credential.type]}
            alt={credential.type}
            width={16}
            height={16}
          />
        </div>
      }
      onRemove={handleRemoveCredential}
      isRemoving={removeCredential.isPending}
      // actions={<CredentialActions credential={credential} />}
    />
  );
};
