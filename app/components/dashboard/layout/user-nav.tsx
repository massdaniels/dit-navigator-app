import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { LogOutIcon, PlusCircle, Settings, User } from "lucide-react";
import { toast } from "~/components/ui/use-toast";
import { loader } from "~/routes/dashboard";
import { useState } from "react";

export function UserNav() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useLoaderData<typeof loader>();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage  src={user?.image ?? undefined} alt="" />
              <AvatarFallback>{user?.fullName?.[0] ?? "?"}</AvatarFallback>
            </Avatar>  
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.fullName ?? "Guest"}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email ?? "No email"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>

            <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
              Profile
              <DropdownMenuShortcut><User/></DropdownMenuShortcut>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate("/dashboard/admin-add")}>
              New Admin
              <DropdownMenuShortcut><PlusCircle/></DropdownMenuShortcut>
            </DropdownMenuItem>

          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {

              navigate("/logout");
          toast({
          description: "Logged out successfully!",
        });
            }}
          >
            Sign Out
            <DropdownMenuShortcut><LogOutIcon/></DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

