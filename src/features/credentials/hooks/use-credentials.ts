import { CredentialType } from "@/generated/prisma/enums";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useCredentialsParams } from "./use-credentials-params";

/**
 * Hook to fetch all credentials using suspense
 */
export const useSuspenseCredentials = () => {
  const [params] = useCredentialsParams();
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));
};

/**
 * Hook to create a new credential
 */
export const useCreateCredential = () => {
  const [params] = useCredentialsParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions(params),
        );
      },
      onError: (error) => {
        console.log(error);
      },
    }),
  );
};

/**
 * Hook to delete a credential
 */
export const useDeleteCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({}),
        );
        queryClient.invalidateQueries(
          trpc.credentials.getOne.queryOptions({ id: data.id }),
        );
      },
      onError: (error) => {
        console.log(error);
      },
    }),
  );
};

/**
 * Hook to fetch a single credential using suspense
 */
export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }));
};

/**
 * Hook to update a credential
 */
export const useUpdateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({}),
        );
        queryClient.invalidateQueries(
          trpc.credentials.getOne.queryOptions({ id: data.id }),
        );
      },
      onError: (error) => {
        console.log(error);
      },
    }),
  );
};

/**
 * Hook to get credentials by type
 */
export const useCredentialsByType = (type: CredentialType) => {
  const trpc = useTRPC();
  return useQuery(trpc.credentials.getByType.queryOptions({ type }));
};
