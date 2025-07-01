import { ActionFunction, ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getUserId, requireUserId } from "~/services/sessions.server";
import { getUserById, imageUploadHandler, updateUser } from "~/services/user.server";
import { useEffect, useRef, useState } from "react";
import { writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { prisma } from "~/services/prisma.server";
import bcrypt from "bcryptjs";
import { profileSchema } from "prisma/zodShema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "~/components/ui/use-toast";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Icons } from "~/components/dashboard/icons";
import { Camera, Lock } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  if (!user) throw redirect("/login");
  return json({ user });
}


export const action: ActionFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) return redirect("/auth/signin");

  const formData = await request.formData();
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const imageFile = formData.get("image") as File;

const result = profileSchema.safeParse({
    fullName,
    email,
    currentPassword,
    newPassword,
  });

  if (!result.success) {
    return json({ errors: " flaten error" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }

  // 🔐 Check if new password is being set and validate current password


  let imageUrl: string | undefined;

  if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
    // Delete old image
    if (user?.image) {
      const oldImagePath = path.join(process.cwd(), "public", user.image);
      if (existsSync(oldImagePath)) {
        await unlink(oldImagePath);
      }
    }

    // Save new image
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const fileName = `user-${userId}-${Date.now()}-${imageFile.name}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);
    imageUrl = `/uploads/${fileName}`;
  }

  const updateData: any = {
    fullName,
    email,
    ...(imageUrl && { image: imageUrl }),
  };

  if (newPassword && newPassword.length > 0) {
      
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return json({ error: "Current password is incorrect" }, { status: 400 });
    }
  
    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return json({ success: true });
};

export default function ProfilePage() {
  const { user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

    const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
const form = useForm<z.infer<typeof profileSchema>>({
  resolver: zodResolver(profileSchema),
  mode: "onChange",
  defaultValues: {
    fullName: user.fullName || "",
    email: user.email || "",
    currentPassword: "",
    newPassword: "",
  },
});
  const { register, formState: { errors } } = form;
const currentPassword = form.watch("currentPassword");

    const actionData = useActionData<typeof action>();

  useEffect(() => {
    if (actionData?.error) {
      toast({
        variant: "destructive",
        description: actionData.error, 
      });
    } else if(actionData?.success) {
      toast({
        variant: "default",
        description: "Profile Updated Successfully",
      });
    }
  }, [actionData, toast]);


// ... (keep your existing imports and other code)

return (
  <div className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-4rem)]">
    <Card className="overflow-hidden h-full">
      {/* Profile Header - Fixed */}
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 md:p-8 sticky top-0 z-10">
        <div className="flex flex-col items-center text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information and security settings
          </p>
        </div>
      </CardHeader>

      {/* Scrollable Content Area */}
      <ScrollArea className="h-[calc(100%-180px)]">
        <CardContent className="p-6 md:p-8">
          <Form 
            method="post" 
            encType="multipart/form-data"
            className="space-y-6"
          >
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage 
                    src={preview || user.image || "/default-avatar.png"} 
                    alt={user.fullName || "User avatar"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-4xl font-medium">
                    {user?.fullName?.substring(0, 2).toUpperCase() ?? ""}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              <div className="w-full max-w-xs">
                <Label htmlFor="image" className="sr-only">Profile Picture</Label>
                <Input
                  ref={fileInputRef}
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer hidden"
                  onChange={handleImageChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  JPG, PNG up to 2MB
                </p>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Icons.user className="h-5 w-5" />
                  Personal Information
                </h2>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    {...register("fullName")}
                    id="fullName"
                    type="text"
                    defaultValue={user.fullName || ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    {...register("email")}
                    id="email"
                    type="email"
                    defaultValue={user.email}
                    required
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security
                </h2>
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    {...register("currentPassword")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    {...register("newPassword")}
                    disabled={!currentPassword}
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>
              </div>
            </div>

            {/* Footer with Save Button - Fixed at bottom */}
            <div className="sticky flex justify-end bottom-0 bg-background pt-6 pb-4">
              <Button
                variant="secondary"
                type="submit"
                disabled={navigation.state === "submitting"}
                className="w-full md:w-auto"
              >
                {navigation.state === "submitting" ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </Form>
        </CardContent>
      </ScrollArea>
    </Card>
  </div>
);
  
}


    // <div className="max-w-md mx-auto p-6 space-y-8">
    //   <div className="text-center">
    //     <h1 className="text-2xl font-bold">Your Profile</h1>
    //     <p className="text-muted-foreground">Manage your account information</p>
    //   </div>

    //   <Form 
    //     method="post" 
    //     encType="multipart/form-data" 
    //     className="  md:space-y-6 bg-card p-6 rounded-lg border"
    //   >
    //     {/* Profile Picture Section */}
    //     <div className="flex flex-col items-center gap-4">
    //       <Avatar className="h-24 w-24">
    //         <AvatarImage 
    //           src={preview || user.image || "/default-avatar.png"} 
    //           alt={user.fullName || ""}
    //           className="object-cover"
    //         />
    //         <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-medium">
    //           {user?.fullName?.substring(0, 2).toUpperCase() ?? ""}
    //         </AvatarFallback>
    //       </Avatar>
          
    //       <div className="w-full">
    //         <Label htmlFor="image" className="sr-only">Profile Picture</Label>
    //         <Input
    //           // ref={fileInputRef}
    //           onChange={handleImageChange}
    //           id="image"
    //           name="image"
    //           type="file"
    //           accept="image/*"
    //           className="cursor-pointer"
    //         />
    //         <p className="text-xs text-muted-foreground mt-1">
    //           JPG, PNG up to 2MB
    //         </p>
    //       </div>
    //     </div>

    //     {/* Basic Info Section */}
    //     <div className="space-y-4">
    //       <h2 className="font-medium text-lg">Basic Information</h2>
          
    //       <div className="space-y-2">
    //         <Label htmlFor="name">Full Name</Label>
    //         <Input
    //           id="name"
    //           type="text"
    //           defaultValue={user.fullName || ""}
    //           required
    //           {...register("fullName")}
    //         />
    //       </div>

    //       <div className="space-y-2">
    //         <Label htmlFor="email">Email Address</Label>
    //         <Input
    //           id="email"
    //           type="email"
    //           defaultValue={user.email}
    //           required
    //           {...register("email")}

    //         />
    //       </div>
    //     </div>

    //     {/* Password Section */}
    //     <div className="space-y-4 pt-4 border-t">
    //       <h2 className="font-medium text-lg">Change Password</h2>
          
    //       <div className="space-y-2">
    //         <Label htmlFor="currentPassword">Current Password</Label>
    //         <Input
    //           id="currentPassword"
    //           type="password"
    //           placeholder="Enter your current password"
    //           {...register("currentPassword")}
    //         />
    //       </div>

    //       <div className="space-y-2">
    //         <Label htmlFor="newPassword">New Password</Label>
    //         <Input
    //           id="newPassword"
    //           // name="newPassword"
    //           type="password"
    //           placeholder="Enter a new password"
    //           disabled={!currentPassword}
    //           {...register("newPassword")}
    //         />
          
    //       </div>
    //     </div>

    //     {/* Submit Button */}
    //     <Button
    //       type="submit"
    //       disabled={navigation.state === "submitting"}
    //       className="w-full"
    //     >
    //       {navigation.state === "submitting" ? "Saving..." : "Save Changes"}
    //     </Button>
    //   </Form>
    // </div>