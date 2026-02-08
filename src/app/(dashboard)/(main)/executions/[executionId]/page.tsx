import { requireAuth } from "@/features/auth/auth-utils";

interface ExecutionIdPageProps {
  params: Promise<{ executionId: string }>;
}

const ExecutonIdPage = async ({ params }: ExecutionIdPageProps) => {
  await requireAuth();
  const { executionId } = await params;
  return <div>ExecutonIdPage: {executionId}</div>;
};

export default ExecutonIdPage;
