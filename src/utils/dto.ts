// dto.ts
// TODO: Shared DTO (Data Transfer Object) types or exports
export interface RegisterDTO {
  email: string;
  password: string;
  role?: "USER" | "ADMIN";
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

export interface ProfileDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: "Beirut" | "Outside Beirut";
}
// --- Product DTOs ---
// Product DTOs

export interface CreateProductDTO {
  title: string;
  description: string;
  images: string[]; // Array of image URLs
  startingBid: number;
  auctionEnd: Date;
  location: "Beirut" | "Outside Beirut";
}

export interface UpdateProductDTO {
  title?: string;
  description?: string;
  images?: string[]; // Array of image URLs
  startingBid?: number;
  auctionEnd?: Date;
  location?: "Beirut" | "Outside Beirut";
}

// dto.ts
export interface ContactDTO {
  subject: string;
  message: string;
}
