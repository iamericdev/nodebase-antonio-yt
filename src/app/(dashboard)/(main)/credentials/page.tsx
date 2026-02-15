import { requireAuth } from "@/features/auth/auth-utils";
import {
  CredentialsContainer,
  CredentialsErrorView,
  CredentialsList,
  CredentialsLoadingView,
} from "@/features/credentials/components/credentials";
import { credentialsParamsLoader } from "@/features/credentials/server/params-loader";
import { prefetchCredentials } from "@/features/credentials/server/prefetch";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  searchParams: Promise<SearchParams>;
};

const CredentialsPage = async ({ searchParams }: Props) => {
  await requireAuth();

  const params = await credentialsParamsLoader(searchParams);
  prefetchCredentials(params);

  return (
    <HydrateClient>
      <CredentialsContainer>
        <ErrorBoundary fallback={<CredentialsErrorView />}>
          <Suspense fallback={<CredentialsLoadingView />}>
            <CredentialsList />
          </Suspense>
        </ErrorBoundary>
      </CredentialsContainer>
    </HydrateClient>
  );
};

export default CredentialsPage;
