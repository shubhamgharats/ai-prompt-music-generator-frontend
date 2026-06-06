"use client";

import { AuthView } from "@daveyplate/better-auth-ui";

export function AuthPageView({ pathname }: { pathname: string }) {
  return (
    <main className="container flex grow flex-col items-center justify-center gap-6">
      <AuthView path={pathname} />
    </main>
  );
}