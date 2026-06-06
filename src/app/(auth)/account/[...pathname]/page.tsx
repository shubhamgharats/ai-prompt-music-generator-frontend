import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import { AuthPageView } from "./view";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({
    pathname: path.split("/"),
  }));
}

export default async function AuthPage({
  params,
}: {
  params: { pathname: string[] };
}) {
  const path = params.pathname.join("/");

  return <AuthPageView pathname={path} />;
}