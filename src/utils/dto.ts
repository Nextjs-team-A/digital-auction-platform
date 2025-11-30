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


