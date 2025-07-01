// app/routes/reset-request.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Form as RemixForm, useActionData } from "@remix-run/react";
import { json, type ActionFunction } from "@remix-run/node";
import { prisma } from "~/services/prisma.server";
import { z } from "zod";
import crypto from "crypto";
import { resetRequestSchema } from "prisma/zodShema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Shell } from "~/components/dashboard/shell";
import { useEffect } from "react";
import { toast } from "~/components/ui/use-toast";

import { sendResetEmail } from "~/utils/email.server"; 

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString() || "";

  const parsed = resetRequestSchema.safeParse({ email });
  if (!parsed.success) {
    return json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return json({ success: true }); // do not leak info
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpiresAt: expires,
    },
  });

  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

  try {
  await sendResetEmail(email, resetUrl);

  console.log()
} catch (err) {
  console.error("Email sending failed:", err);
}

  return json({ success: true });
};

export default function ResetRequest() {
  const actionData = useActionData<typeof action>()
  const form = useForm<z.infer<typeof resetRequestSchema>>({
    resolver: zodResolver(resetRequestSchema),
    mode: "onChange"
  });

  useEffect(() => {
    if(actionData?.success){
      toast({
        variant: "default",
        description: "A link was sent to your email for password reset"
      })
    }
  }, [actionData, toast])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-indigo-950 p-0" >
      <Shell className="max-w-lg">
        <Card>
          <CardHeader className="space-y-1 bg-indigo-600 rounded-t-md mb-3 ">
            <CardTitle className="text-2xl flex items-center text-white justify-center">Hello Admin</CardTitle>
            <CardTitle className="text-lg text-indigo-200 flex items-center justify-center">Reset your Password</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
                <Form {...form}>
                  <RemixForm method="post" className="space-y-4">
                    <FormField
                      name="email"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                  {/* {actionData?.error && ( // there is no need for now
                  <p className="text-sm text-red-500">{actionData.error}</p>
                )} */}
                    <Button disabled={!form.formState.isValid || form.formState.isSubmitting} className="bg-indigo-700 hover:bg-indigo-800 w-full text-white" type="submit">Send Reset Link</Button>
                  </RemixForm>
                </Form>
              </CardContent>
              <CardFooter className="flex items-center justify-center content-center gap-2">
                <p className="text-gray-400 text-sm"> We will send a link in your email for password reset!</p>
              </CardFooter>
            </Card>
            </Shell>
    </div>
  );
}
