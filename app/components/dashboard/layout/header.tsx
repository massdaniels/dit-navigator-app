import { Link } from "@remix-run/react";

import { cn } from "~/lib/utils";

import { UserNav } from "./user-nav";
import { MobileSidebar } from "./mobile-sidebar";
import { siteConfig } from "~/controls/site";
import { Shield } from "lucide-react";

export default function Header() {
  return (
    <div className="supports-backdrop-blur:bg-background/60 fixed left-0 right-0 top-0 z-20 border-b bg-background/95 backdrop-blur">
      <nav className="flex h-15 items-center justify-between px-4">
        <div className="hidden lg:block lg:py-1">
          <Link
            rel="noreferrer"
            to={"/"}
            target="_blank"
            className="flex items-center pb-1"
          >
            <img className="h-6 w-6 mr-1 rounded-lg" src={siteConfig.logo} alt="" />
            <p className="text-lg">{siteConfig.name}</p>
          </Link>
          <p className="text-slate-400 flex justify-between">Admin Dashboard <Shield/></p>
        </div>
        <div className={cn("block lg:!hidden")}>
          <MobileSidebar />
        </div>
        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </nav>
    </div>
  );
}
