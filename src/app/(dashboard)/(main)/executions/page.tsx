import { requireAuth } from "@/features/auth/auth-utils";

const ExecutionsPage = async () => {
  await requireAuth();
  return <div>ExecutionsPage</div>;
};

export default ExecutionsPage;
