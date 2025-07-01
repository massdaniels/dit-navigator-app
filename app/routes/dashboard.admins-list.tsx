import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { prisma } from "~/services/prisma.server";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import { ActionFunctionArgs } from "@remix-run/node";
import { Calendar1, Loader2, Trash2, UserPlus2, Users2 } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { getUserId } from "~/services/sessions.server";
import { Suspense, useEffect } from "react";
import { toast } from "~/components/ui/use-toast";
import { Shell } from "~/components/dashboard/shell";
import BreadCrumb from "~/components/dashboard/breadcrumb";
import { Skeleton } from "~/components/ui/skeleton";

export async function loader({ request }: LoaderFunctionArgs) {
      const userId = await getUserId(request);
      if (!userId) return redirect("/auth/signin");
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      image: true,
      email: true,
      createdAt: true,
    },
  });

  return json({ admins });
}
export const breadcrumbItems = [
  { title: "Admins", link: "/dashboard/admins" },
];

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const adminId = formData.get("adminId")?.toString();
  const actionType = formData.get("_action")?.toString();

  if (actionType === "delete" && adminId) {
    // Prevent deleting the last admin
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return json(
        { error: "Cannot delete the last admin account" },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id: adminId } });
    return json({success: true})
  }

  return json({ error: "Invalid action" }, { status: 400 });
}

export default function AdminListPage() {
  const { admins } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isDeleting = navigation.state === "submitting";
    const actionData = useActionData<typeof action>();
  useEffect(() => {
    if (actionData && "error" in actionData) {
      toast({
        variant: "destructive",
        description: actionData.error, 
      });
    } else if(actionData?.success) {
      toast({
        variant: "default",
        description: "Admin deleted Successfully",
      });
    }
  }, [actionData, toast]);

  return (
    
    <Shell variant="sidebar">
      <BreadCrumb items={breadcrumbItems} />
      <div className="flex flex-col rounded-t-lg p-6 md:p-8 md:flex-row md:items-center md:justify-between gap-4  bg-gradient-to-r from-primary/10 to-secondary/10">
        <div>
          <h1 className="text-2xl font-bold">Administrators</h1>
          <p className="text-muted-foreground">
            Manage admin accounts with full system access
          </p>
        </div>
        <Link to="/dashboard/admin-add">
        <Button variant="outline" >
            <UserPlus2 className="h-4 w-4"/>
            Add Admin
        </Button>
        </Link>
      </div>

      {/* {"error" in navigation.formData && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {navigation.formData.get("error") as string}
          </AlertDescription>
        </Alert>
      )} */}
        <Suspense
          fallback={
            <Skeleton className="h-[calc(75vh-220px)] rounded-md border" />
          }
        >
      {admins.length === 0 ? (
        <Card className="flex-1 flex items-center justify-center">
          <CardContent className="py-12 text-center">
            <Users2 className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No admins found</h3>
            <p className="text-muted-foreground">
              Get started by creating your first admin account
            </p>
            <Button className="mt-4" asChild>
              Add Admin
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="flex-1 rounded-b-lg border">
          <div className="space-y-4 p-4">
            {admins.map((admin) => (
              <Card key={admin.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={admin.image || "/default-avatar.png"} 
                        alt={admin.fullName || "Admin avatar"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                        {admin.fullName?.substring(0, 2).toUpperCase() || "AD"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{admin.fullName}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="whitespace-nowrap">
                      <Calendar1 className="h-3 w-3 mr-1" />
                      Joined {formatDistanceToNow(new Date(admin.createdAt))} ago
                    </Badge>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-4 flex justify-end">
                  <Form method="post">
                    <input type="hidden" name="adminId" value={admin.id} />
                    <Button
                      type="submit"
                      name="_action"
                      value="delete"
                      variant="danger"
                      size="sm"
                      disabled={isDeleting}
                      className="gap-2"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Remove Admin
                    </Button>
                  </Form>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
      </Suspense>
    </Shell>
  );
}