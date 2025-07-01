import { useNavigate } from "@remix-run/react";
import { Heading } from "~/components/ui/heading";
import { Button } from "~/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Icons } from "../dashboard/icons";

export function CategoryTableHeader({
  isPending,
  totalCount,
}: {
  isPending: boolean;
  totalCount: number;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <Heading
        title={`POI Categories (${totalCount})`}
        description="Manage system poi categories"
      />
      <Button
        onClick={() => navigate("/dashboard/poi-category/new")}
        disabled={isPending}
      >
        {isPending && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
        <Icons.add className="mr-2 h-4 w-4" /> Add New
      </Button>
    </div>
  );
}
