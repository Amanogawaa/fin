import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {/* <h1 className="text-base font-medium font-satoshi">
          Name of the course
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm font-light font-inter">80%</span>
          <div className="w-14">
            <div className="h-2 rounded-full overflow-hidden bg-gray-300">
              <div className="h-full rounded-full bg-orange-600 w-[75%]"></div>
            </div>
          </div>
        </div> */}
      </div>
    </header>
  );
}
