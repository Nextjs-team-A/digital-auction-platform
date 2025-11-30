// dto.ts
// TODO: Shared DTO (Data Transfer Object) types or exports
export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?:"SEEKER" | "PROVIDER" | "ADMIN" ; 
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ProfileDTO {
  id: string;
  name: string;
  email: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}

export interface ResetPasswordDTO {
  email: string;
}

export interface ForgotPasswordDTO{
    token: string;
    newPassword: string;
}
