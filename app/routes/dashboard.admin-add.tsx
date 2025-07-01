import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import bcrypt from "bcryptjs";
import { prisma } from "~/services/prisma.server";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "~/components/ui/use-toast";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AdminSchema } from "prisma/zodShema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const fullName = formData.get("fullName")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!fullName || !email || !password) {
    return json({ error: "All fields are required" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return json({ error: "Admin with this email already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  return json({success: true})
}

export default function AddAdminPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const form = useForm<z.infer<typeof AdminSchema>>({
    resolver: zodResolver(AdminSchema),
    mode: "onChange"
  });
    useEffect(() => {
      if (actionData && "error" in actionData) {
        toast({
          variant: "destructive",
          description: actionData.error, // "Invalid credentials"
        });
      } else if(actionData?.success) {
        toast({
          variant: "default",
          description: "Admin created Successfully", 
        });
      }
    }, [actionData, toast]);

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Add New Administrator
          </CardTitle>
          <CardDescription>
            Create a new admin account with full access privileges
          </CardDescription>
        </CardHeader>
        
        <CardContent>

          <Form method="post" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  name="fullName" 
                  type="text" 
                  required 
                  placeholder="Daniel Mass" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="admin@example.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
              />
              <p className="text-sm text-muted-foreground">
                Minimum 8 characters with at least one uppercase, one lowercase, and one number
              </p>
            </div>

            <CardFooter className="flex justify-end px-0 pb-0 pt-4">
              <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Admin...
                  </>
                ) : (
                  "Create Admin Account"
                )}
              </Button>
            </CardFooter>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}