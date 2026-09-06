import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import Logo from "../assets/logo.jpg";
import { HiOutlineGlobeAlt } from "react-icons/hi2";
import { FiLogOut } from "react-icons/fi";
import { HiMiniUser } from "react-icons/hi2";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import ForgotPassword from "./ForgotPassword";
import { AUTH_REQUIRED_EVENT, ensureValidSession } from "../services/apiClient";

const BRAND_NAME = "Home";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isProfilePage = location.pathname === "/profile";
  const isHomePage = location.pathname === "/";
  const isSearchResultsPage = location.pathname.toLowerCase() === "/events/all";
  const shouldShowSearchBar = isHomePage || isSearchResultsPage;

  const { t, i18n } = useTranslation();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const updateLoginState = () => {
    try {
      const token = localStorage.getItem("access_token");
      const raw = localStorage.getItem("user_data");
      if (token && raw) {
        const parsed = JSON.parse(raw);
        const candidates = [
          parsed?.name,
          parsed?.username,
          parsed?.user?.name,
          parsed?.user?.username,
          parsed?.email,
          parsed?.user?.email,
        ];
        const first = candidates.find(
          (v) => typeof v === "string" && v.trim().length > 0
        );
        const display = first
          ? first.includes("@")
            ? first.split("@")[0]
            : first
          : "User";

        setUserName(display);
        setIsLoggedIn(true);
      } else {
        setUserName(null);
        setIsLoggedIn(false);
      }
    } catch {
      setUserName(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    updateLoginState();

    const validateCurrentSession = async () => {
      const hasAccessToken = !!localStorage.getItem("access_token");
      const hasUserData = !!localStorage.getItem("user_data");

      if (!hasAccessToken || !hasUserData) {
        updateLoginState();
        return;
      }

      const isValid = await ensureValidSession({ notify: true });
      if (isValid) {
        updateLoginState();
      }
    };

    const handleAuthRequired = () => {
      setUserName(null);
      setIsLoggedIn(false);
      setShowForgotPassword(false);
      setShowSignUp(false);
      setShowSignIn(true);
      setShowSignOutConfirm(false);
      setIsMobileMenuOpen(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void validateCurrentSession();
      }
    };

    void validateCurrentSession();

    window.addEventListener("storage", updateLoginState);
    window.addEventListener("userLoginChanged", updateLoginState);
    window.addEventListener("focus", validateCurrentSession);
    window.addEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", updateLoginState);
      window.removeEventListener("userLoginChanged", updateLoginState);
      window.removeEventListener("focus", validateCurrentSession);
      window.removeEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignUpClick = () => {
    setShowSignUp(true);
    setShowSignIn(false);
    setShowForgotPassword(false);
  };

  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
    setShowForgotPassword(false);
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setShowSignIn(false);
    setShowSignUp(false);
  };

  const closeModals = () => {
    setShowSignIn(false);
    setShowSignUp(false);
    setShowForgotPassword(false);
  };

  const handleSearch = () => {
    const q = searchQuery.trim();
    const target = `/events/All${q ? `?q=${encodeURIComponent(q)}` : ""}`;
    navigate(target);
  };

  const handleLogin = (payload) => {
    const normalize = (val) => {
      if (typeof val === "string") return val;

      if (val && typeof val === "object") {
        const candidates = [
          val.name,
          val.username,
          val.user?.name,
          val.user?.username,
          val.user?.email,
          val.email,
        ];
        const first = candidates.find(
          (v) => typeof v === "string" && v.trim().length > 0
        );

        return first
          ? first.includes("@")
            ? first.split("@")[0]
            : first
          : "User";
      }

      return "User";
    };

    setUserName(normalize(payload));
    setIsLoggedIn(true);
    closeModals();
  };

  const handleSignout = () => {
    try {
      const raw = localStorage.getItem("user_data");

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const uid = parsed?.id || parsed?.user?.id || parsed?.userId;

          if (uid != null) {
            const cacheKey = `userOrders_${uid}`;
            if (localStorage.getItem(cacheKey)) {
              localStorage.removeItem(cacheKey);
            }
          }
        } catch { /* Ignore malformed cached user data during logout. */ }
      }

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
    } catch { /* Logout still clears local state if the API is unavailable. */ }

    setUserName(null);
    setIsLoggedIn(false);
    setShowSignOutConfirm(false);

    window.dispatchEvent(new Event("userLoginChanged"));

    if (isProfilePage) {
      navigate("/");
    }
  };

  const handleSignOutClick = () => {
    setShowSignOutConfirm(true);
  };

  const getDisplayName = () => {
    if (typeof userName === "string") return userName;

    const dn =
      userName?.name ||
      userName?.username ||
      userName?.user?.name ||
      userName?.user?.username ||
      userName?.user?.email ||
      "User";

    return typeof dn === "string"
      ? dn.includes("@")
        ? dn.split("@")[0]
        : dn
      : "User";
  };

  const getUserInitial = () => {
    const dn =
      typeof userName === "string"
        ? userName
        : userName?.name ||
          userName?.username ||
          userName?.user?.name ||
          userName?.user?.username ||
          userName?.user?.email ||
          "U";

    const initial = String(dn).trim().charAt(0) || "U";
    return initial.toUpperCase();
  };

  return (
    <>
      <div className="navbar fixed top-0 left-0 right-0 bg-white shadow-md z-40 py-1 transition-opacity duration-300">
        <div className="w-full max-w-7xl mx-auto px-4 py-1 md:py-2 sm:px-4 md:px-6 lg:px-8">
          {/* ================= MOBILE / TABLET NAVBAR (below lg) ================= */}
          <div className="flex flex-col lg:hidden w-full">
            {/* Top row */}
            <div className="flex items-center justify-between w-full">
              <Link to="/" className="flex items-center gap-2 sm:gap-3">
                <img
                  src={Logo}
                  alt="Logo"
                  className="w-10 h-10 sm:w-15 sm:h-15 object-contain transition duration-200 hover:scale-105"
                />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap hover:text-[#e51f4b] transition-colors duration-200">
                  {BRAND_NAME}
                </span>
              </Link>

              <button
                ref={menuButtonRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-[#e51f4b] transition-colors"
              >
                {isMobileMenuOpen ? (
                  <HiXMark className="w-7 h-7" />
                ) : (
                  <HiBars3 className="w-7 h-7" />
                )}
              </button>
            </div>

            {/* Search bar below logo/menu - HOME ONLY */}
            {shouldShowSearchBar && (
              <div className="mt-2 w-full">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder={t("nav.search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    className="w-full pl-10 pr-4 py-1.5 lg:py-2 bg-gray-200 rounded text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile dropdown menu */}
            {isMobileMenuOpen && (
              <div ref={mobileMenuRef} 
                    className="mt-2 bg-white border rounded-lg shadow-md p-3 flex flex-col gap-3">
                {/* Language switcher */}
                <div className="flex items-center j`ustify-center text-black gap-2 border-b pb-3">
                  <button
                    onClick={() => {
                      i18n.changeLanguage("en");
                      localStorage.setItem("lng", "en");
                    }}
                    className={`px-2 py-1 rounded text-sm font-semibold transition-colors ${
                      i18n.language === "en"
                        ? "text-[#e51f4b]"
                        : "text-gray-600 hover:text-[#e51f4b]"
                    }`}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      outline: "none",
                    }}
                  >
                    {t("nav.language.en")}
                  </button>

                  <HiOutlineGlobeAlt className="w-5 h-5 text-gray-600" />

                  <button
                    onClick={() => {
                      i18n.changeLanguage("my");
                      localStorage.setItem("lng", "my");
                    }}
                    className={`px-2 py-1 rounded text-sm font-semibold transition-colors ${
                      i18n.language === "my"
                        ? "text-[#e51f4b]"
                        : "text-gray-600 hover:text-[#e51f4b]"
                    }`}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      outline: "none",
                    }}
                  >
                    {t("nav.language.my")}
                  </button>
                </div>

                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center text-gray-700 p-2 rounded hover:bg-gray-100 hover:text-red-600 transition-colors border-b pb-3"
                >
                  <span className="font-medium">Home</span>
                </Link>

                {/* User/Profile actions */}
                {isLoggedIn ? (
                  <div className="flex flex-col gap-2">
                    {!isProfilePage && (
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center text-gray-700 p-2 rounded hover:bg-gray-100 hover:text-red-600 transition-colors"
                      >
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-gray-600">
                            {getUserInitial()}
                          </span>
                        </div>

                        <span className="font-medium">{getDisplayName()}</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleSignOutClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center text-gray-700 p-2 rounded hover:bg-gray-100 hover:text-red-600 transition-colors"
                    >
                      <FiLogOut className="w-5 h-5 mr-2" />
                      <span>{t("nav.signOut")}</span>
                    </button>
                  </div>
                ) : (
                  !isProfilePage && (
                    <button
                      onClick={() => {
                        handleSignInClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center text-gray-700 p-2 rounded hover:bg-gray-100 hover:text-red-600 transition-colors"
                      style={{ backgroundColor: "transparent" }}
                    >
                      <HiMiniUser className="w-5 h-5 mr-2" />
                      <span>{t("nav.signIn")}</span>
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* ================= DESKTOP NAVBAR (lg and above) ================= */}
          <div className="hidden lg:flex flex-wrap items-center w-full">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={Logo}
                alt="Logo"
                className="w-16 h-16 object-contain transition duration-200 hover:scale-105"
              />
              <span className="text-sm lg:text-base font-medium text-gray-700 whitespace-nowrap hover:text-[#e51f4b] transition-colors duration-200">
                {BRAND_NAME}
              </span>
            </Link>

            {/* Search - HOME ONLY */}
            {shouldShowSearchBar ? (
              <div className="flex items-center flex-auto mx-3 min-w-[300px]">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={t("nav.search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    className="w-full pl-10 pr-6 py-3 bg-gray-200 rounded text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={!searchQuery.trim()}
                  className="text-white px-6 py-3 rounded ml-3 transition duration-200 hover:scale-105 bg-[#f28fa5] hover:opacity-80 active:bg-[#d45573] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("nav.search")}
                </button>
              </div>
            ) : (
              <div className="flex-auto mx-3 min-w-[300px]" />
            )}

            {/* Language switcher */}
            <div className="flex items-center ml-6 text-black gap-0">
              <button
                onClick={() => {
                  i18n.changeLanguage("en");
                  localStorage.setItem("lng", "en");
                }}
                className={`px-2 py-1 rounded text-sm font-semibold transition-colors ${
                  i18n.language === "en"
                    ? "text-[#e51f4b]"
                    : "text-gray-600 cursor-pointer hover:text-[#e51f4b]"
                }`}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                }}
              >
                {t("nav.language.en")}
              </button>

              <HiOutlineGlobeAlt className="w-5 h-5 mx-1 text-gray-600" />

              <button
                onClick={() => {
                  i18n.changeLanguage("my");
                  localStorage.setItem("lng", "my");
                }}
                className={`px-2 py-1 rounded text-sm font-semibold transition-colors ${
                  i18n.language === "my"
                    ? "text-[#e51f4b]"
                    : "text-gray-600 cursor-pointer hover:text-[#e51f4b]"
                }`}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                }}
              >
                {t("nav.language.my")}
              </button>
            </div>

            {/* User/Profile */}
            <div className="relative ml-4 xl:ml-10 min-w-[180px] lg:min-w-[220px] flex justify-start">
              {isLoggedIn ? (
                <div className="flex items-center gap-5 xl:gap-7">
                  {!isProfilePage && (
                    <Link
                      to="/profile"
                      className="flex items-center text-gray-600 p-2 cursor-pointer hover:text-red-600 transition-colors duration-200 hover:bg-gray-100"
                      style={{ backgroundColor: "transparent" }}
                    >
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-gray-600">
                          {getUserInitial()}
                        </span>
                      </div>

                      <span className="font-medium">{getDisplayName()}</span>
                    </Link>
                  )}

                  <button
                    onClick={handleSignOutClick}
                    className="flex items-center text-gray-600 border-none outline-none shadow-none p-2 cursor-pointer hover:text-red-600 transition-colors duration-200"
                  >
                    <FiLogOut className="w-5 h-5 mr-1.5" />
                    <span>{t("nav.signOut")}</span>
                  </button>
                </div>
              ) : (
                !isProfilePage && (
                  <button
                    onClick={handleSignInClick}
                    className="flex items-center text-gray-600 border-none outline-none shadow-none p-0 cursor-pointer hover:text-red-600 transition-colors duration-200"
                    style={{ backgroundColor: "transparent" }}
                  >
                    <HiMiniUser className="w-5 h-5 mr-2" />
                    <span>{t("nav.signIn")}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <SignUp
        isOpen={showSignUp}
        onClose={closeModals}
        onSwitchToSignIn={handleSignInClick}
      />
      <SignIn
        isOpen={showSignIn}
        onClose={closeModals}
        onSwitchToSignUp={handleSignUpClick}
        onSwitchToForgotPassword={handleForgotPasswordClick}
        onLogin={handleLogin}
      />
      <ForgotPassword
        isOpen={showForgotPassword}
        onClose={closeModals}
        onSwitchToSignIn={handleSignInClick}
        onSwitchToSignUp={handleSignUpClick}
      />

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div
          className="fixed inset-0 z-[13000] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSignOutConfirm(false);
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-sm w-full">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              {t("signOut.Confirm")}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base mb-6">
              {t("signOut.ConfirmText")}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                {t("signOut.Cancel")}
              </button>
              <button
                onClick={handleSignout}
                className="px-4 py-2 text-white bg-[#f28fa5] rounded-lg hover:opacity-90 transition-colors duration-200 font-medium"
              >
                {t("signOut.SignOut")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;