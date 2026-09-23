import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VisitSync } from "@/components/VisitSync";
import { SaveTourNudge } from "@/components/SaveTourNudge";
import { getCurrentUser } from "@/lib/data";
import "./globals.css";

const display = Baloo_2({ variable: "--font-display", subsets: ["latin"], weight: ["600", "800"] });
const body = Nunito({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Campbell River Little Libraries", template: "%s · CR Little Libraries" },
  description: "Find every free little library in Campbell River, BC — share photos and collect badges on the tour.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser().catch(() => null);

  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Suspense fallback={<div className="h-16 border-b-[2.5px] border-ink bg-sun" />}>
          <SiteHeader />
        </Suspense>
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
        <Suspense>
          <VisitSync />
          <SaveTourNudge signedIn={!!user} />
        </Suspense>
      </body>
    </html>
  );
}
