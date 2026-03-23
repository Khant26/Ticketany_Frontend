import React, { useEffect, useState } from "react";
import Logo from "../assets/logo.jpg";
import { useTranslation } from "react-i18next";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const OTP_RESEND_DELAY_SECONDS = 60;

function SignUp({ isOpen, onClose, onSwitchToSignIn }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [otpCode, setOtpCode] = useState("");
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (!isOpen || !showOtpVerification || resendCountdown <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setResendCountdown((currentCountdown) => currentCountdown - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isOpen, showOtpVerification, resendCountdown]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!formData.password.trim()) {
      setError("Please enter a password");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const nameFromEmail = formData.email.split("@")[0];
    if (!nameFromEmail.trim()) {
      setError("Invalid email format");
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

      const payload = {
        email: formData.email.trim(),
        name: nameFromEmail,
        password: formData.password,
      };

      const registerRes = await fetch(`${API_BASE_URL}auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await registerRes.json().catch(() => ({}));

      if (!registerRes.ok) {
        let errorMessage = "Registration failed. Please try again.";
        let isAlreadyRegistered = false;

        // Handle various error formats
        if (data?.message) errorMessage = data.message;
        else if (data?.error) errorMessage = data.error;
        else if (data?.detail) errorMessage = data.detail;
        else if (data?.email && Array.isArray(data.email)) {
          errorMessage = data.email[0];
          // Check if email already exists
          if (errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('exist')) {
            isAlreadyRegistered = true;
            errorMessage = "📧 This email is already registered! Please enter your OTP code to verify.";
          }
        }
        else if (data?.password && Array.isArray(data.password))
          errorMessage = data.password[0];
        else if (data?.non_field_errors && Array.isArray(data.non_field_errors))
          errorMessage = data.non_field_errors[0];

        // If email already registered, show OTP verification instead of error
        if (isAlreadyRegistered) {
          setSuccess(errorMessage);
          setShowOtpVerification(true);
          setResendCountdown(OTP_RESEND_DELAY_SECONDS);
        } else {
          setError(errorMessage);
        }
        setLoading(false);
        return;
      }

      setSuccess("✅ Registration successful! Check your email for OTP code.");
      setShowOtpVerification(true);
      setResendCountdown(OTP_RESEND_DELAY_SECONDS);
      setLoading(false);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        "Error during registration. Please check your internet connection.",
      );
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || loading) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

      const resendRes = await fetch(`${API_BASE_URL}auth/resend-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim() }),
      });

      const data = await resendRes.json().catch(() => ({}));

      if (!resendRes.ok) {
        let errorMessage = "Unable to resend OTP. Please try again.";

        if (data?.message) errorMessage = data.message;
        else if (data?.error) errorMessage = data.error;
        else if (data?.detail) errorMessage = data.detail;
        else if (data?.email && Array.isArray(data.email))
          errorMessage = data.email[0];
        else if (data?.non_field_errors && Array.isArray(data.non_field_errors))
          errorMessage = data.non_field_errors[0];

        setError(errorMessage);
        setLoading(false);
        return;
      }

      setSuccess(data?.message || "✅ A new OTP code has been sent to your email.");
      setResendCountdown(OTP_RESEND_DELAY_SECONDS);
      setLoading(false);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError("Error while resending OTP. Please check your internet connection.");
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otpCode.trim()) {
      setError("Please enter the OTP code");
      return;
    }

    if (otpCode.length !== 6) {
      setError("OTP code must be 6 digits");
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

      const payload = {
        email: formData.email.trim(),
        otp_code: otpCode.trim(),
      };

      const verifyRes = await fetch(`${API_BASE_URL}auth/verify-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await verifyRes.json().catch(() => ({}));

      if (!verifyRes.ok) {
        let errorMessage = "OTP verification failed. Please try again.";

        if (data?.message) errorMessage = data.message;
        else if (data?.error) errorMessage = data.error;
        else if (data?.detail) errorMessage = data.detail;
        else if (data?.otp_code && Array.isArray(data.otp_code))
          errorMessage = data.otp_code[0];
        else if (data?.email && Array.isArray(data.email))
          errorMessage = data.email[0];
        else if (data?.non_field_errors && Array.isArray(data.non_field_errors))
          errorMessage = data.non_field_errors[0];

        setError(errorMessage);
        setLoading(false);
        return;
      }

      setSuccess("✅ Email verified successfully! You can now sign in.");
      setTimeout(() => {
        onSwitchToSignIn();
        setFormData({ email: "", password: "" });
        setOtpCode("");
        setShowOtpVerification(false);
        setResendCountdown(0);
      }, 2000);
      setLoading(false);
    } catch (err) {
      console.error("Verification error:", err);
      setError(
        "Error during verification. Please check your internet connection.",
      );
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (showOtpVerification) {
      handleVerifyEmail(e);
    } else {
      handleRegister(e);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-4"
      style={{
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold"
          style={{
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          ×
        </button>

        <div className="text-center mb-6 flex">
          <img
            src={Logo}
            alt="Logo"
            className="w-25 h-25 object-contain mb-2"
          />
          <h2 className="text-2xl text-gray-800 mt-7 ml-1">
            {t("signUp.title")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {!showOtpVerification && (
            <>
              <div>
                <label
                  htmlFor="email"
                  className="block text-2xl font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  placeholder={t("signIn.emailPlaceholder")}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-2xl font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 text-black py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                    placeholder={t("signIn.passwordPlaceholder")}
                    minLength="8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible size={20} />
                    ) : (
                      <AiOutlineEye size={20} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Minimum 8 characters
                </p>
              </div>
            </>
          )}

          {showOtpVerification && (
            <div>
              <label
                htmlFor="otpCode"
                className="block text-2xl font-medium text-gray-700 mb-1"
              >
                OTP Code
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Check your email ({formData.email}) for the 6-digit OTP code
              </p>
              <p className="text-xs text-gray-600 mb-3">
                This code will expire in 10 minutes.
              </p>
              <input
                type="text"
                id="otpCode"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtpCode(value);
                }}
                className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength="6"
                inputMode="numeric"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Enter the 6-digit code from your email
              </p>
              <div className="flex gap-3 mt-4 justify-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0 || loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
                  style={{
                    backgroundColor: resendCountdown > 0 ? "#ccc" : "#f28fa5",
                  }}
                >
                  {resendCountdown > 0
                    ? `Resend ${String(Math.floor(resendCountdown / 60)).padStart(2, "0")}:${String(resendCountdown % 60).padStart(2, "0")}`
                    : "Resend OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtpVerification(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-pink-600 border-2 border-pink-600 rounded-lg hover:bg-pink-50 transition-all duration-200"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#f28fa5" }}
          >
            {loading
              ? showOtpVerification
                ? "Verifying..."
                : "Registering..."
              : showOtpVerification
                ? "Verify Email"
                : t("signUp.signUp")}
          </button>
          <div className="text-center pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">{t("signUp.Already")}</p>
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-pink-600 hover:text-pink-700 font-semibold transition-colors duration-200"
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {t("signIn.signIn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
