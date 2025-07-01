// app/schemas/signupSchema.ts
import { z } from "zod";

export const signupSchema = z.object({
    email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .trim()
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must be less than 100 characters")
    .email("Enter a valid email address"),

  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&#]/, "Password must contain at least one special character (@$!%*?&#)"),
  confirmPassword: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&#]/, "Password must contain at least one special character (@$!%*?&#)"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


// app/validators/loginSchema.ts


export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .trim()
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must be less than 100 characters")
    .email("Enter a valid email address"),

  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&#]/, "Password must contain at least one special character (@$!%*?&#)"),
});


export const resetRequestSchema = z.object({
  email: z.string().email("A valid email is required"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&#]/, "Password must contain at least one special character (@$!%*?&#)"),
  token: z.string().min(32, "Invalid token"),
});




export const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["currentPassword"],
});

export const AdminSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});



export const BuildingSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Building Name must be at least 3 characters" }),
  type: z
    .string()
    .min(3, { message: "Building description must be at least 3 characters" }),
  height: z.coerce.number(),
});


export const CategorySchema = z.object({
  categoryPoi: z.string().min(1, { message: "Category poi is required" }),
  categoryName: z.string().min(1, { message: "Category name is required" }),
  description: z.string().nullable().optional(),
});


export const POISchema = z.object({
  categoryPoi: z.string().min(1, { message: "Category poi is required" }),
  poiValue: z.string().min(1, { message: "poi value is required" }),
  poiName: z.string().min(1, { message: "poi name is required" }),
  poiAlias: z.string().nullable().optional(),
  displayOrder: z.coerce
    .number()
    .min(0, { message: "Display order must be a positive number" }),
});


