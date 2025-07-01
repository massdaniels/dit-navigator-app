import { prisma } from "./prisma.server";

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });
}

export async function updateUser(
  id: string,
  data: {
    name: string;
    email: string;
    password?: string;
    image?: string;
  }
) {
  return prisma.user.update({
    where: { id },
    data: {
      fullName: data.name,
      email: data.email,
      ...(data.password && { password: data.password }),
      ...(data.image && { image: data.image }),
    },
  });
}

// app/utils/file-upload.server.ts
import path from 'path';
import { promises as fs } from 'fs';
import type { UploadHandler } from "@remix-run/node";

export const imageUploadHandler: UploadHandler = async ({
  name,
  filename,
  data
}) => {
  // Only handle image uploads
  if (name !== "image" || !filename) return null;

  // Create upload directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  // Generate unique filename
  const uniqueFilename = `${Date.now()}-${filename.replace(/\s+/g, '-')}`;
  const filePath = path.join(uploadDir, uniqueFilename);

  // Convert AsyncIterable<Uint8Array> to Buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of data) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  // Write file to disk
  await fs.writeFile(filePath, buffer);

  return `/uploads/${uniqueFilename}`;
};

export async function deleteOldImage(oldPath: string | null) {
  if (!oldPath || !oldPath.startsWith('/uploads/')) return;
  
  try {
    const fullPath = path.join(process.cwd(), 'public', oldPath);
    await fs.unlink(fullPath);
  } catch (err) {
    console.error("Error deleting old image:", err);
  }
}



export async function getAllFeedbacks() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return feedbacks;
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return [];
  }
}
