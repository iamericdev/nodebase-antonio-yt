import { requireAuth } from "@/features/auth/auth-utils";

const WorkflowsPage = async () => {
  await requireAuth();

  return <div>WorkflowsPage</div>;
};

export default WorkflowsPage;
