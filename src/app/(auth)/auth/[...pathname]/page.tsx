import { AuthView } from "@daveyplate/better-auth-ui"
import { authViewPaths } from "@daveyplate/better-auth-ui/server"

export const dynamicParams = false

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({
    pathname: path.split("/"),
  }))
}

export default async function AuthPage({
  params,
}: {
  params: { pathname: string[] }
}) {
  const path = params.pathname.join("/")

  return (
    <main className="container flex grow flex-col items-center justify-center self-center p-4 md:p-6">
      <AuthView path={path} />
    </main>
  )
}