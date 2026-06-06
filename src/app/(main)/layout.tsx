import "../../styles/globals.css";
import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { Providers } from "~/components/providers";
import { Toaster } from "~/components/ui/sonner";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";

import { AppSidebar } from "~/components/sidebar/app-sidebar";

import { Separator } from "~/components/ui/separator";
import SoundBar from "~/components/sound-bar";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Home",
  description: "AI Music Generator",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="overflow-hidden">
        <Providers>
          <SidebarProvider>
            <AppSidebar />

            <SidebarInset className="flex h-screen flex-col">
              <header className="bg-background sticky top-0 z-10 border-b px-4 py-2">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1" />

                  <Separator
                    orientation="vertical"
                    className="mr-2 h-4"
                  />

                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto">
                {children}
              </main>

              <SoundBar />
            </SidebarInset>
          </SidebarProvider>

          <Toaster />
        </Providers>
      </body>
    </html>
  );
}