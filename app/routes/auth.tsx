import { Image } from "@radix-ui/react-avatar";
import { Outlet, Link } from "@remix-run/react";
import { useState } from "react";
import { Icons } from "~/components/dashboard/icons";
import { siteConfig } from "~/controls/site";
import { createMeta } from "~/utils/metadata";


export const meta = () => createMeta("Admin", "Signing in to the admin dasnboard")

export default function App() {
  
  return (
    <div className="">
      <Link
        to="/"
        className="absolute left-8 top-6 z-20 flex items-center text-lg font-bold tracking-tight"
      >
        <img src={siteConfig.logo} className="mr-2 size-6" aria-hidden="true" />
        <span>{siteConfig.name}</span>
      </Link>
      <main >
        <Outlet />
      </main>
    </div>
  );
}
