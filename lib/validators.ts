/**
 * Zod schemas — used by both API routes and client forms.
 */

import { z } from "zod";

/** Max length for an avatar data URL (base64). ~120KB cap. */
export const AVATAR_MAX_LEN = 160_000;

/** Validates a base64-encoded image data URL (PNG / JPEG / WebP). */
export const imageDataUrlSchema = z
  .string()
  .max(AVATAR_MAX_LEN, "Image is too large — try a smaller picture")
  .regex(
    /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/,
    "Invalid image format"
  );

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name is too long"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
  image: imageDataUrlSchema.optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
