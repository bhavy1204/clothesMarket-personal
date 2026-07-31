import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { LockKey, ShieldCheck } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { userService, sellerService } from "@/api/index";
import { resetPasswordSchema } from "@/lib/validators"; // add this schema — see note below
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

/**
 * ResetPasswordPage
 * Common for both actors — rendered at /reset-password and
 * /seller/reset-password. Expects `email` in router state (passed
 * from ForgotPasswordPage). Collects OTP + new password and calls
 * service.resetPassword({ email, otp, newPassword }).
 */
export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSeller = location.pathname.startsWith("/seller");
  const service = isSeller ? sellerService : userService;

  const email = location.state?.email;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email },
  });

  // If someone lands here directly without going through forgot-password,
  // there's no email to work with — send them back.
  if (!email) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-bg">
        <div className="w-full max-w-sm text-center">
          <p className="text-sm text-text-muted mb-4">
            Please request a password reset OTP first.
          </p>
          <Link
            to={isSeller ? "/seller/forgot-password" : "/forgot-password"}
            className="text-primary font-medium hover:underline"
          >
            Go to forgot password
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await service.resetPassword(data);
      toast.success("Password reset successfully. Please login again.");
      navigate(isSeller ? "/seller/login" : "/login", { replace: true });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Couldn't reset your password",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-text">Reset your password</h1>
          <p className="text-sm text-text-muted mt-1">
            Enter the OTP sent to <span className="font-medium">{email}</span>{" "}
            and choose a new password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="OTP"
            type="text"
            inputMode="numeric"
            maxLength={6}
            leftIcon={<ShieldCheck size={16} />}
            error={errors.otp?.message}
            {...register("otp")}
          />

          <Input
            label="New password"
            type="password"
            leftIcon={<LockKey size={16} />}
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />

          <Input
            label="Confirm new password"
            type="password"
            leftIcon={<LockKey size={16} />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
          >
            Reset password
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          <Link
            to={isSeller ? "/seller/login" : "/login"}
            className="text-primary font-medium hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

