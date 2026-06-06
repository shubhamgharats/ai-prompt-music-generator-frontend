"use client";

import { AuthView as BetterAuthView } from "@daveyplate/better-auth-ui";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

export function AuthPageView({ pathname }: { pathname: string }) {
  const router = useRouter();

  return (
    <main className="container flex grow flex-col items-center justify-center gap-6">
     {["settings","security"].includes(pathname)&&(
            <Button
        className="self-start"
        onClick={() => router.back()}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back
      </Button>
     )}

      <BetterAuthView path={pathname} />
    </main>
  );
}