import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Cog, Library, MessageCircleQuestionIcon } from "lucide-react";
import { NavMain } from "./app-main";

const data = {
  user: {
    name: "domsiroll",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "courses",
      url: "/amu/course",
      icon: Library,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Cog,
    },
    {
      title: "Get Help",
      url: "#",
      icon: MessageCircleQuestionIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5 ">
              <>
                {/* <IconInnerShadowTop className="!size-5" /> */}
                <span className="text-base font-semibold">amu ai</span>
              </>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>{/* <SignOutButton /> */}</SidebarFooter>
    </Sidebar>
  );
}
