// app/routes/logout.tsx
import { LoaderFunction, redirect } from "@remix-run/node";
import { logout } from "~/services/sessions.server";

export const loader: LoaderFunction = async ({ request }) => {
  return logout(request);

};
