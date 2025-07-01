import { useState } from 'react';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card';
import { ActionFunctionArgs } from "@remix-run/node";
import { prisma } from '~/services/prisma.server';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const rating = parseInt(formData.get("rating") as string, 10);
  const message = formData.get("message") as string;

  if (!name || !email || isNaN(rating) || !message) {
    return json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    await prisma.feedback.create({
      data: { name, email, rating, message },
    });
    return redirect("/auth/feed-response"); // or back to form with success
  } catch (error) {
    console.error("Feedback submission error:", error);
    return json({ error: "Something went wrong" }, { status: 500 });
  }
}

export default function FeedbackPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [rating, setRating] = useState(5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-indigo-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader className='bg-indigo-600 rounded-t-md' >
            <CardTitle className="text-2xl font-bold text-white text-center">Share Your Feedback</CardTitle>
            <CardDescription className="text-center text-white">
              We'd love to hear your thoughts about our service
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form method="post" onSubmit={() => setIsSubmitting(true)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Danels Mass"
                    required
                    className="mt-1"
                  />

                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    className="mt-1"
                  />

                </div>

                <div>
                  <Label>How would you rate your experience?</Label>
                  <div className="flex items-center mt-2 space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <svg
                          className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="rating" value={rating} />
                </div>

                <div>
                  <Label htmlFor="message">Your Feedback</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="What did you like or what could we improve?"
                    required
                    className="mt-1"
                  />

                </div>
              </div>

              <Button
                type='submit'
                
                className="w-full bg-indigo-700 text-white hover:bg-indigo-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </Form>
          </CardContent>

        </Card>
      </div>
    </div>
  );
}