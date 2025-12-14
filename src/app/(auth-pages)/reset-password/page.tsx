import ResetPasswordForm from "./ResetPasswordForm";

export const metadata = {
  title: "Reset Password",
  description: "Reset Password to access your account.",
};

export default function ResetPasswordPage() {
  return (
    <div>
      <h1>Reset Password</h1>
      <ResetPasswordForm />
    </div>
  );
}
