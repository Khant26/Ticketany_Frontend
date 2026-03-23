import React, { useState, useEffect } from "react";
import Logo from "../assets/logo.jpg";
import { useTranslation } from "react-i18next";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { showSuccess, showError, showWarning, showInfo } from "../utils/toastNotification";

function SignIn({
  isOpen,
  onClose,
  onSwitchToSignUp,
  onSwitchToForgotPassword,
  onLogin,
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyOtp, setShowVerifyOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (!isOpen || !showVerifyOtp || resendCountdown <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setResendCountdown((currentCountdown) => currentCountdown - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isOpen, showVerifyOtp, resendCountdown]);

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || otpLoading) {
      return;
    }

    setOtpLoading(true);
    try {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
      const response = await fetch(`${baseUrl}auth/resend-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("OTP code sent to your email.");
        setResendCountdown(60);
      } else {
        const errorMsg = data.error || data.message || data.detail || "Unable to resend OTP. Please try again.";
        showError(errorMsg);
        setError("");
      }
    } catch (err) {
      showError("Network error. Please try again.");
      setError("");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) {
      showWarning("Please enter a valid 6-digit OTP code");
      return;
    }

    setOtpLoading(true);
    try {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
      const response = await fetch(`${baseUrl}auth/verify-email/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp_code: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("Email verified! You can now sign in.");
        setTimeout(() => {
          setShowVerifyOtp(false);
          setOtpCode("");
        }, 1500);
      } else {
        const errorMsg = data.error || data.detail || data.message || "OTP verification failed";
        showError(errorMsg);
      }
    } catch (err) {
      showError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
      const response = await fetch(`${baseUrl}auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const access = data.access_token || data.token || data.access;
        const refresh = data.refresh_token || data.refresh;

        if (access) localStorage.setItem("access_token", access);
        if (refresh) localStorage.setItem("refresh_token", refresh);
        localStorage.setItem("user_data", JSON.stringify(data));

        const extractDisplayName = (payload) => {
          if (!payload) return null;
          const candidates = [
            payload.name,
            payload.username,
            payload.user?.name,
            payload.user?.username,
            payload.user?.email,
            payload.email,
          ];
          const first = candidates.find(
            (v) => typeof v === "string" && v.trim().length > 0,
          );
          if (!first) return null;
          return first.includes("@") ? first.split("@")[0] : first;
        };

        const displayName = extractDisplayName(data) || "User";
        showSuccess(`Welcome, ${displayName}! You've successfully signed in.`);
        window.dispatchEvent(new Event("userLoginChanged"));
        if (onLogin) onLogin(displayName);

        onClose && onClose();
        setFormData({ email: "", password: "" });
      } else {
        const errorMsg = data.error || data.detail || data.message || "Authentication failed";
        // Check if error is about unverified email
        if (errorMsg.toLowerCase().includes('verify')) {
          showWarning(errorMsg);
          setShowVerifyOtp(true);
        } else {
          showError(errorMsg);
        }
      }
    } catch (err) {
      showError("Network error. Please try again.");
    } finally {
      setLoading(false);
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
            {t("signIn.title")}
          </h2>
        </div>

        <form onSubmit={showVerifyOtp ? handleVerifyOtp : handleSubmit} className="space-y-4">
          {!showVerifyOtp && (
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
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible size={20} />
                    ) : (
                      <AiOutlineEye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {showVerifyOtp && (
            <div>
              <label
                htmlFor="otpCode"
                className="block text-2xl font-medium text-gray-700 mb-1"
              >
                Verify Your Email
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Enter the 6-digit OTP code sent to {formData.email}
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
              <div className="flex gap-3 mt-4 justify-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0 || otpLoading}
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
                  onClick={() => setShowVerifyOtp(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-pink-600 border-2 border-pink-600 rounded-lg hover:bg-pink-50 transition-all duration-200"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            {!showVerifyOtp && (
              <button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors duration-200"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  padding: 0,
                  marginTop: 0,
                }}
              >
                {t("signIn.forgotPassword")}
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#f28fa5",
            }}
            disabled={loading || otpLoading}
          >
            {otpLoading
              ? "Verifying OTP..."
              : loading
                ? t("signIn.signingIn") || "Signing in..."
                : showVerifyOtp
                  ? "Verify Email"
                  : t("signIn.signIn")}
          </button>

          <div className="text-center pt-2 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">{t("signIn.noAccount")}</p>
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-pink-600 hover:text-pink-700 font-semibold transition-colors duration-200"
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {t("signIn.signUp")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
