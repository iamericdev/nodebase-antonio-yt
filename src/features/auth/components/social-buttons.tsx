"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const SocialButtons = ({ isPending }: { isPending: boolean }) => {
  const router = useRouter();

  const handleSocialAuth = async (provider: "google" | "github") => {
    try {
      const data = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (data.error) {
        toast.error(data.error.message);
        return;
      }

      toast.success("Account created successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        disabled={isPending}
        onClick={() => handleSocialAuth("github")}
        variant="outline"
        className="w-full"
      >
        <Image src="/logos/github.svg" alt="GitHub" width={20} height={20} />
        Continue with GitHub
      </Button>
      <Button
        type="button"
        disabled={isPending}
        onClick={() => handleSocialAuth("google")}
        variant="outline"
        className="w-full"
      >
        <Image src="/logos/google.svg" alt="Google" width={20} height={20} />
        Continue with Google
      </Button>
    </div>
  );
};
