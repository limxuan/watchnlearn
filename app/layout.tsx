import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import ClientOnly from "@/components/client-only";
import Navbar from "@/components/navbar";
import InitUserStore from "@/components/init-user-store";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-dvh w-dvw">
      <head />
      <body className={`${geistSans.className} bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientOnly>
            <InitUserStore />
            <main className="flex min-h-screen flex-col items-center bg-black">
              <Navbar />
              <div className="w-full flex-1">{children}</div>
            </main>
          </ClientOnly>
        </ThemeProvider>
      </body>
    </html>
  );
}
