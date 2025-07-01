import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { createThemeSessionResolver } from "remix-themes";

const isProduction = process.env.NODE_ENV === "production";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "admin_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60, // This session lasts in 1 hour
    secrets: [process.env.SESSION_SECRET || "fallback"],
    ...(isProduction ? { domain: process.env.APP_URL, secure: true } : {}),
  },
});



export const themeSessionResolver = createThemeSessionResolver(sessionStorage);


export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function getUserId(request: Request): Promise<string | null> {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return session.get("userId") || null;
}

export async function requireUserId(request: Request) {
  const userId = await getUserId(request);
  if (!userId) throw redirect("/auth/signin");
  return userId;
}

export async function logout(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return redirect("/auth/signin", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
    
  });
} 


export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function requireAnonymous(request: Request, redirectTo: string = "/dashboard/map-editor") {
  const userId = await getUserId(request);
  if (userId) throw redirect(redirectTo);
}
