import { Link } from '@remix-run/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card';
import { Button } from '~/components/ui/button';



export default function FeedbackResponsePgae() {
    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-indigo-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Thank You!</CardTitle>
            <CardDescription className="text-center">
              We appreciate you taking the time to share your feedback
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="mt-4 text-gray-600">
              Your feedback has been submitted successfully. We'll review it and use it to improve our service.
            </p>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/" className="text-indigo-600 hover:text-indigo-700">
                Return to Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
    );
  
}