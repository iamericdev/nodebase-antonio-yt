import { requireAuth } from "@/features/auth/auth-utils";

const CredentialsPage = async () => {
  await requireAuth();
  return <div>CredentialsPage</div>;
};

export default CredentialsPage;
