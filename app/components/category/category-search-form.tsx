import { useEffect, useTransition } from "react";
import { CategorySearchFormValues } from "~/types";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useIsSubmitting } from "~/hooks/use-mounted";
import { Card } from "~/components/ui/card";
import { Search } from "lucide-react";

export function CategorySearchForm({
  searchParams,
}: {
  searchParams: CategorySearchFormValues;
}) {
  const [isPending, startTransition] = useTransition();
  const { isSubmitting, setIsSubmitting } = useIsSubmitting();

  useEffect(() => {
    if (!isPending) {
      setIsSubmitting(false);
    }
  }, [isPending, setIsSubmitting]);

  return (
    // <div className="grid gap-2 py-4 sm:grid-cols-4">
    //   <div className="grid gap-1">
    //     <Input
    //       placeholder="Category Name"
    //       name="categoryName"
    //       defaultValue={searchParams.categoryName}
    //     />
    //   </div>
    //   <Button
    //     type="submit"
    //     variant="default"
    //     disabled={isSubmitting}
    //     onClick={() => {
    //       startTransition(() => {
    //         setIsSubmitting(true);
    //       });
    //     }}
    //   >
    //     {isSubmitting && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
    //     Search
    //   </Button>
    // </div>
    <Card className="w-full max-w-md">

        <form
          className="flex items-center space-x-2"
          onSubmit={(e) => {
            e.preventDefault();
            // Trigger search logic here
          }}
        >
          <Input
            className="flex-grow outline-none border-none"
            type="text"
            placeholder="Search name..."
            
            defaultValue={searchParams.categoryName}
          />
          <Button size="icon" 
          type="submit" 
          variant="ghost"
          disabled={isSubmitting}
          onClick={() => {
              startTransition(() => {
                setIsSubmitting(true);
              });
            }}
          >
            {isSubmitting ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}

          </Button>
        </form>
          
    </Card>
  );
}
