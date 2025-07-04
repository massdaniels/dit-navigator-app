import { useState } from "react";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "~/components/ui/use-toast";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { Category } from "~/types";
import { useNavigate } from "@remix-run/react";
import { AlertModal } from "../dashboard/modal/alert-modal";
// CSRF context is available but not used in this component
// import { usePOICategoryCsrfContext } from "~/routes/dashboard.POI-categories";

interface CellActionProps {
  data: Category;
}

export function CellAction({ data }: CellActionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // CSRF token is available via context but not needed here
  // const csrfToken = usePOICategoryCsrfContext();
  const navigate = useNavigate();

  const onConfirm = async () => {
    try {
      setLoading(true);
      // Delete API call would go here
      toast({
        title: "POI category deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Something went wrong.",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "POI category ID copied to clipboard.",
    });
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() =>
              navigate(`/dashboard/category/${data.id}`)
            }
          >
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
