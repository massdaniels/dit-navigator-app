import { Card, CardContent } from "~/components/ui/card";
import { Box, BoxIcon } from "lucide-react";

interface EmptyProps {
  title?: string;
  description?: string;
}

export function Empty({ title = "No Data", description = "There is nothing to show here yet." }: EmptyProps) {
  return (
    <Card className="flex flex-col items-center justify-center text-center py-12 shadow-none border-dashed border-2">
      <CardContent>
        <div className="flex flex-col items-center gap-2">
          <BoxIcon className="h-10 w-10 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
