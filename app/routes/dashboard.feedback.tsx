import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { DownloadIcon, FilterIcon, MessageSquareIcon, ReplyIcon, StarIcon, Trash2Icon } from "lucide-react";
import { Suspense } from "react";
import BreadCrumb from "~/components/dashboard/breadcrumb";
import { Shell } from "~/components/dashboard/shell";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Empty } from "~/components/ui/empty";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { prisma } from "~/services/prisma.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  return json({ feedbacks });
}
export const breadcrumbItems = [
  { title: "Feedback", link: "/dashboard/feedback" },
];

export default function FeedbackAdminPage() {
  const { feedbacks } = useLoaderData<typeof loader>();


  return (
    <Shell variant="sidebar" >
        <BreadCrumb items={breadcrumbItems} />
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Feedback</h1>
          <p className="text-sm text-muted-foreground">
            {feedbacks.length} {feedbacks.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export
          </Button>
          {/* <Button variant="outline" size="sm" className="gap-2">
            <FilterIcon className="h-4 w-4" />
            Filters
          </Button> */}
        </div>
      </div>

      {/* Content Area */}
              <Suspense
          fallback={
            <Skeleton className="h-[calc(75vh-220px)] rounded-md border" />
          }
        >
      <div className="flex-1 overflow-hidden rounded-lg border bg-background shadow-sm">
        {feedbacks.length === 0 ? ( 
          <Empty
            
            title="No feedback yet"
            description="User feedback will appear here when submitted."

            />
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {feedbacks.map((fb) => (
                <Card key={fb.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                        <span className="font-medium">{fb.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <CardTitle className="text-base">{fb.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{fb.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(fb.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-4 w-4 ${star <= fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{fb.rating}.0</span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-line">{fb.message}</p>

                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      </Suspense>
    </Shell>
  )
}


