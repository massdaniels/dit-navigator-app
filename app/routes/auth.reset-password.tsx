// app/routes/reset-password.tsx
import { Link, useNavigate, useSearchParams } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { json, redirect, type ActionFunction } from "@remix-run/node";
import { prisma } from "~/services/prisma.server";
import bcrypt from "bcryptjs";
import { Form as RemixForm, useActionData } from "@remix-run/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { resetPasswordSchema } from "prisma/zodShema";
import { Shell } from "~/components/dashboard/shell";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { useEffect } from "react";
import { toast } from "~/components/ui/use-toast";
import { join } from "@prisma/client/runtime/library";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const password = formData.get("password")?.toString() || "";
  const token = formData.get("token")?.toString() || "";

  const result = resetPasswordSchema.safeParse({ password, token });
  if (!result.success) {
    return json({ error: result.error.flatten() }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiresAt: { gte: new Date() },
    },
  });

  if (!user) {
    return json({ error: { form: "Invalid or expired link" } }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  }
);
  
  return redirect("/auth/signin")

  
};

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const actionData = useActionData<typeof action>()
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { token },
  });

  useEffect(() => {
    if(actionData?.success){
      toast(
        {
          variant:"default",
          description: "The password is reset, Login to your account"
        }
      )
    }
  })


  return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-indigo-950 p-0" >
          <Shell className="max-w-lg">
            <Card>
              <CardHeader className="space-y-1 bg-indigo-600 rounded-t-md mb-3 ">
                <CardTitle className="text-2xl flex items-center text-white justify-center">Welcome Admin</CardTitle>
                <CardTitle className="text-lg text-indigo-200 flex items-center justify-center">Enter new Password to reset your Account</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                    <Form {...form}>
                      <RemixForm method="post" className="space-y-4">
                        <input type="hidden" {...form.register("token")} />

                        <FormField
                          name="password"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field}  />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {actionData?.error?.form && (
                          <div className="flex justify-between items-center">
                          <p className="text-red-500">{actionData.error.form}</p>
                          <Link to="/auth/reset-request" className="text-sm text-slate-800 dark:text-slate-400 hover:underline " >Send Again</Link>
                          </div>

                        )}

                        <Button disabled={!form.formState.isValid || form.formState.isSubmitting} className="bg-indigo-700 text-white hover:bg-indigo-800 w-full" type="submit">Reset Password</Button>
                      </RemixForm>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-gray-400 text-sm">Remember your password and make it secret to avoid faults</p>
                  </CardFooter>
                </Card>
                </Shell>
        </div>

  );
}
