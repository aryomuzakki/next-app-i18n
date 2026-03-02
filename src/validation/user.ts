// validation/user.ts
import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(3, { error: "Name must be at least 3 characters long." })
    .max(100, { error: "Name cannot be longer than 100 characters." })
    .or(z.string().nullish()),
  email: z
    .email({ error: "Invalid email address." })
    .or(z.string().nullish()),
}).refine((data) => {
  if (!data.name && !data.email) {
    return false;
  }
  return true;
}, {
  message: "At least one of name or email must be filled and valid.",
  path: ["name", "email"],
}).refine((data) => {
  if (data.name && !data.email) {
    return z.string().min(3).max(100).safeParse(data.name).success
  }
  return true;
}, {
  message: "Name minimum 3 character",
  path: ["name"],
}).refine((data) => {
  if (!data.name && data.email) {
    return z.email().safeParse(data.email).success;
  }
  return true;
}, {
  message: "Invalid email address",
  path: ["email"],
}).refine((data) => {
  if (data.name && data.email) {
    // Both name and email are filled, validate both
    return z.string().min(3).max(100).safeParse(data.name).success && z.email().safeParse(data.email).success;
  }
  return true;
}, {
  error: "Name or email must be valid.",
  path: ["name", "email"],
});

export type ProfileUpdateType = z.infer<typeof profileSchema>;
