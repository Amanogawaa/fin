import type { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/_layouts/app-header";
import { AppSidebar } from "@/components/_layouts/app-sidebar";

export const metadata: Metadata = {
  title: "Amu",
  icons: { icon: "/convex.svg" },
};

export default function AmuLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
