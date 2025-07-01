import type { ActionFunction, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form as RemixForm, Link, useActionData } from "@remix-run/react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import * as HelmetAsync from "react-helmet-async"; // 
import { Shell } from "~/components/dashboard/shell";
import { createMeta } from "~/utils/metadata";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/services/prisma.server";
import { createUserSession, requireAnonymous } from "~/services/sessions.server";
import { loginSchema } from "prisma/zodShema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import bcrypt from "bcryptjs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/use-toast";
import { useEffect } from "react";
import { Loader } from "lucide-react";
const { Helmet } = HelmetAsync; // 

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request);
  return null;
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email") as string;
  const password = form.get("password") as string;

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      return json({ error: result.error.flatten() }, { status: 400 });
    }



  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return json({ error: "Invalid credentials" }, { status: 400 });
    
  }

  return createUserSession(user.id, "/dashboard/map-editor");
};

type loginData = z.infer<typeof loginSchema>;



export default function SignInPage() {

    const actionData = useActionData<typeof action>();

  const form = useForm<loginData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // or "onBlur" or "onChange"
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (actionData?.error) {
      toast({
        variant: "destructive",
        description: actionData.error, // "Invalid credentials"
      });
    } 
  }, [actionData, toast]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-indigo-950 p-0" >

      <Shell className="max-w-lg">
        <Card>
          <CardHeader className="space-y-1 bg-indigo-600 rounded-t-md mb-3 ">
            <CardTitle className="text-2xl flex items-center text-white justify-center">Welcome back Admin</CardTitle>
            <CardTitle className="text-lg text-indigo-200 flex items-center justify-center">Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Form {...form}>
              <RemixForm method="post" className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input required type="email" placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password"    {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* {actionData?.error && (
                  <p className="text-sm text-red-500">{actionData.error}</p>
                )} */}

                <Button className="bg-indigo-700 hover:bg-indigo-800 w-full" disabled={!form.formState.isValid || form.formState.isSubmitting} type="submit">
                  { form.formState.isSubmitting ? <Loader className=" animate-spin"/> : "Sign In" }
                  
                  </Button>
              </RemixForm>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              <span className="mr-1 hidden sm:inline-block">
                Don&apos;t have an account?
              </span>
              <Link
                aria-label="Sign up"
                to="/"
                className="text-primary underline-offset-4 transition-colors hover:underline"
              >
                Go Back
              </Link>
            </div>
            <Link
              aria-label="Reset password"
              to="/auth/reset-request"
              className="text-sm text-primary underline-offset-4 transition-colors hover:underline"
            >
              Reset password
            </Link>
          </CardFooter>
        </Card>
      </Shell>
    </div>
  );
}
