import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import { AuthPageView } from "./view";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({
    pathname: path.split("/"),
  }));
}

type PageProps = {
  params: Promise<{
    pathname: string[];
  }>;
};

export default async function AuthPage({ params }: PageProps) {
  const { pathname } = await params;
  const path = pathname.join("/");

  return <AuthPageView pathname={path} />;
}