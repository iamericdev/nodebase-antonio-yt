import { requireAuth } from "@/features/auth/auth-utils";

interface CredentialIdPageProps {
  params: Promise<{ credentialId: string }>;
}

const CredentialIdPage = async ({ params }: CredentialIdPageProps) => {
  await requireAuth();
  const { credentialId } = await params;

  return <div>CredentialIdPage: {credentialId}</div>;
};

export default CredentialIdPage;
