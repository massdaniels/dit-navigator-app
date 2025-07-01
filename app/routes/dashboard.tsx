
import { Outlet } from "@remix-run/react";
import Header from "~/components/dashboard/layout/header";
import Sidebar from "~/components/dashboard/layout/sidebar";
import { createMeta } from "~/utils/metadata";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUserId, requireUserId } from "~/services/sessions.server";
import { prisma } from "~/services/prisma.server";
import { LoaderFunctionArgs } from "@remix-run/node";


export const meta = () =>
  createMeta("Dashboard", "Admin dashboard to manage location data");

export const loader: LoaderFunction = async ({ request }) => {

  await requireUserId(request);
  
  const userId = await getUserId(request);

  if (!userId) {
    return json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      image: true,
    },
  });

  return json({ user });
};


export default function App() {
  return (
    <>
      <Header />
      <div className="flex h-screen">
        <Sidebar />
        <main className="w-full pt-16">
          <Outlet />
        </main>
      </div>
    </>
  );
}
