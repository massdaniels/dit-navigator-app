// app/models/category.server.ts
import { Prisma } from "@prisma/client";
import { prisma } from "~/services/prisma.server";

export async function getCategories({
  page,
  limit,
  categoryName,
  orderBy,
  order,
}: {
  page: number;
  limit: number;
  categoryName?: string;
  orderBy?: string;
  order?: "asc" | "desc";
}) {
  const where = categoryName
    ? { name: { contains: categoryName, mode: "insensitive" as Prisma.QueryMode } }
    : undefined;

  const [data, count] = await Promise.all([
    prisma.category.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: orderBy ? { [orderBy]: order || "asc" } : undefined,
    }),
    prisma.category.count({ where }),
  ]);

  return { data, count };
}
