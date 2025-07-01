// routes/resources/categories.ts
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  console.log("Category create action received request!");
  console.log("Request URL:", request.url);
  console.log("Request Method:", request.method);

  const { prisma } = await import("~/services/prisma.server");

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  console.log("FormData - name:", name, "description:", description);

  const parsed = createCategorySchema.safeParse({ name, description });

  if (!parsed.success) {
    console.error("Validation failed:", parsed.error.flatten());
    return json({ success: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  try {
    console.log("Attempting to create category with data:", parsed.data);
    const newCategory = await prisma.category.create({
      data: parsed.data,
    });
    console.log("Category created successfully:", newCategory);
    return json({ success: true, category: newCategory });
  } catch (error: any) {
    console.error("Error creating category in Prisma:", error); // Log the full error
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return json({ success: false, errors: { formErrors: ["Category name already exists."] } }, { status: 409 });
    }
    return json({ success: false, errors: { formErrors: ["Failed to create category: " + error.message || "Unknown error"] } }, { status: 500 });
  }
}