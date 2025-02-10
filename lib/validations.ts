import { z } from "zod";

export const signUpSchema = z.object({
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  username: z.string().min(3),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  birthday: z.string().min(10),
  password: z.string().min(8),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
