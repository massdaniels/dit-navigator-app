// routes/resources/categories.$categoryId.ts
import { type ActionFunctionArgs, json, } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/services/prisma.server";

const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").optional(), // Optional for PATCH
  description: z.string().optional(),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const categoryId = params.id;
  if (!categoryId) {
    return json({error: "Id not found"}, {status: 400})
  }

  const formData = await request.formData();
  const _method = formData.get("_method"); // For handling PUT/DELETE via POST

  if (_method === "patch") {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const parsed = updateCategorySchema.safeParse({ name, description });

    if (!parsed.success) {
      return json({ success: false, errors: parsed.error.flatten() }, { status: 400 });
    }

    try {
      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: parsed.data,
      });
      return json({ success: true, category: updatedCategory });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        return json({ success: false, errors: { formErrors: ["Category name already exists."] } }, { status: 409 });
      }
      console.error("Error updating category:", error);
      return json({ success: false, errors: { formErrors: ["Failed to update category."] } }, { status: 500 });
    }
  } else if (_method === "delete") {
    try {
      await prisma.category.delete({
        where: { id: categoryId },
      });
      return json({ success: true, message: "Category deleted successfully." });
    } catch (error) {
      console.error("Error deleting category:", error);
      return json({ success: false, errors: { formErrors: ["Failed to delete category."] } }, { status: 500 });
    }
  }

  return json({ success: false, message: "Method not allowed." }, { status: 405 });
}
