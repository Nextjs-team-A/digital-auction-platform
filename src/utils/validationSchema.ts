import { z } from "zod";

/* ---------------------------------------------
   USER AUTH VALIDATIONS (WEEK 1)
----------------------------------------------*/

// Register Schema (User table only)
export const RegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["USER", "ADMIN"]).optional(), // ADMIN only via seeding
});

// Login Schema
export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Forgot Password Schema
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// Reset Password (token + newPassword)
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// Change Password (authenticated user)
export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

/* ---------------------------------------------
   PROFILE VALIDATION (WEEK 1)
   Matches your Prisma Profile Model:
   firstName?: string
   lastName?: string
   phone?: string
   location?: "Beirut" | "Outside Beirut"
----------------------------------------------*/

// Accept only these two valid locations.
const locationEnum = z.enum(["Beirut", "Outside Beirut"]);

// Lebanese phone number validation
const phoneRegex = /^(\+961|0)[0-9]{8}$/;

// Create Profile Schema
export const CreateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .optional(),
  phone: z
    .string()
    .regex(phoneRegex, "Invalid Lebanese phone number format")
    .optional(),
  location: locationEnum.optional(),
});

// Update Profile Schema (all optional)
export const UpdateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().regex(phoneRegex).optional(),
  location: locationEnum.optional(),
});
/* ---------------------------------------------
   PRODUCT VALIDATIONS 
----------------------------------------------*/

// Create Product Schema
export const CreateProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required"),
  startingBid: z.number().positive("Starting bid must be greater than 0"),
  auctionEnd: z.date().refine(date => date > new Date(), "Auction end date must be in the future"),
  location: z.enum(["Beirut", "Outside Beirut"], "Location is required"),
});

// Update Product Schema (all optional)
export const UpdateProductSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  images: z.array(z.string().url()).optional(),
  startingBid: z.number().positive().optional(),
  auctionEnd: z.date().refine(date => date > new Date()).optional(),
  location: z.enum(["Beirut", "Outside Beirut"]).optional(),
});
