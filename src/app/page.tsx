import { requireAuth } from "@/features/auth/auth-utils";

const Home = async () => {
  await requireAuth();
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
};

export default Home;
