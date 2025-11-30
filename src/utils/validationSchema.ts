// validation.ts
// TODO: Shared validation helpers (zod/schemas)
// utils/validationSchemas.ts

import * as z from 'zod'

// Common validation patterns
const email = z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')

const password = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' })

const lebanesePhoneNumber = z.string()
    .regex(/^(\+961|0)[0-9]{8}$/, {
        message: 'Please enter a valid Lebanese phone number (format: +961xxxxxxxx or 0xxxxxxxx)'
    })

// Enums from Prisma schema
const Role = z.enum(['USER', 'ADMIN'])
const AuctionStatus = z.enum(['ACTIVE', 'ENDED', 'CANCELLED'])
const DeliveryStatus = z.enum(['PENDING', 'REQUESTED', 'PICKED_UP', 'DELIVERED_PAID', 'CANCELLED'])

// Base profile schema
const baseProfileSchema = z.object({
    firstName: z.string()
        .min(3, 'First name must be at least 3 characters')
        .max(50, 'First name must be at most 50 characters'),
    lastName: z.string()
        .min(3, 'Last name must be at least 3 characters')
        .max(50, 'Last name must be at most 50 characters'),
    phone: lebanesePhoneNumber,
    location: z.string()
        .min(3, 'Location must be at least 3 characters')
        .max(200, 'Location must be at most 200 characters')
})

// Register schema
export const registerSchema = z.object({
    email,
    password,
    ...baseProfileSchema.shape
})

// Login schema
export const loginSchema = z.object({
    email,
    password
})

// Profile update schema (all fields optional)
export const updateProfileSchema = z.object({
    firstName: baseProfileSchema.shape.firstName.optional(),
    lastName: baseProfileSchema.shape.lastName.optional(),
    phone: baseProfileSchema.shape.phone.optional(),
    location: baseProfileSchema.shape.location.optional()
}).partial()

// Change password schema
export const changePasswordSchema = z.object({
    currentPassword: password,
    newPassword: password,
    confirmNewPassword: z.string()
}).superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
        ctx.addIssue({
            path: ['confirmNewPassword'],
            code: z.ZodIssueCode.custom,
            message: 'New password and confirmation must match'
        })
    }
})


// Reset password schema
export const resetPasswordSchema = z.object({
    email
})

// Product schema
export const productSchema = z.object({
    title: z.string()
        .min(2, 'Title must be at least 2 characters')
        .max(100, 'Title must be at most 100 characters'),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must be at most 1000 characters'),
    images: z.array(z.string().url('Image URL must be valid')),
    startingBid: z.number()
        .min(1, 'Starting bid must be at least 1'),
    auctionEnd: z.date()
        .min(new Date(), 'Auction end date must be in the future'),
    location: z.string()
        .min(2, 'Location must be at least 2 characters')
        .max(100, 'Location must be at most 100 characters')
})

// Bid schema
export const bidSchema = z.object({
    amount: z.number()
        .min(1, 'Bid amount must be at least 1')
})

// Export types for TypeScript usage
export type RegisterFormData = z.infer<typeof registerSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type UpdateProfileData = z.infer<typeof updateProfileSchema>
export type ChangePasswordData = z.infer<typeof changePasswordSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
export type ProductData = z.infer<typeof productSchema>
export type BidData = z.infer<typeof bidSchema>