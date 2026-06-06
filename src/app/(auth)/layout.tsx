import type { Metadata } from "next";
import "~/styles/globals.css";

import { Geist } from "next/font/google";
import { Providers } from "~/components/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Music Generator",
  description: "Music Generation using GenAI",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body
        className="
          min-h-screen 
          bg-background 
          font-sans 
          antialiased
        "
      >
        <Providers>
          {children}
                  <Toaster
          position="top-right"
          richColors
          closeButton
        />
        </Providers>


      </body>
    </html>
  );
}