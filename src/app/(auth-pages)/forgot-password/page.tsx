import ForgotPasswordForm from "./ForgotPasswordClient";
export const metadata = {
  title: "Forgot Password | Digital Auction Platform",
  description: "Forgot Password to access your account.",
};
export default function ForgotPasswordPage() {
  return (
    <div>
      <h1>Forgot Password</h1>
      <ForgotPasswordForm />
    </div>
  );
}
