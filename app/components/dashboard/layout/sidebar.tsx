import { cn } from "~/lib/utils";
import { useMenu } from "./menu-provider";
import { DashboardNav } from "../dashboard-nav";

export default function Sidebar() {
  const { navItems } = useMenu();
  return (
    <nav
      className={cn(`relative  hidden max-h-full w-72 border-r pt-16 lg:block`)}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
              Overview
            </h2>
            <DashboardNav items={navItems} />
          </div>
        </div>
      </div>
    </nav>
  );
}
