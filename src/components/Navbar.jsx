import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Logo from "../assets/logo.jpg";
import { HiOutlineGlobeAlt } from "react-icons/hi2";
import { FiLogOut } from "react-icons/fi";
import { HiMiniUser } from "react-icons/hi2";
import { Link, Navigate } from "react-router-dom";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import ForgotPassword from "./ForgotPassword";
import { useNavigate, useLocation } from "react-router-dom";


function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isProfilePage = location.pathname === "/profile";
  const { t, i18n } = useTranslation();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(null); // was hard‑coded 'HybridDev'
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize login state from localStorage to persist across refresh
  useEffect(() => {
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
      }
    } catch {
      // ignore JSON errors
    }
  }, []);

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

  // Navigate to All Events page with search query
  const handleSearch = () => {
    const q = searchQuery.trim();
    const target = `/events/all${q ? `?q=${encodeURIComponent(q)}` : ""}`;
    navigate(target);
  };

  // Accept a username from SignIn; normalize to a safe string
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
            if (localStorage.getItem(cacheKey))
              localStorage.removeItem(cacheKey);
          }
        } catch {
        }
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
    } catch {
      
    }
    setUserName(null);
    setIsLoggedIn(false);

    if(isProfilePage){
      navigate("/");
    }
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 bg-white shadow-md z-40
                 py-1"
      >
        <div className="flex flex-wrap items-center w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <Link to="/">
          <img
            src={Logo}
            alt="Logo"
            className="w-16 h-16 object-contain transition transform-500 hover:scale-105 "
          />
        </Link>

        {!isProfilePage ? ( <div className="flex items-center flex-auto mx-1 sm:mx-2 md:mx-3 min-w-[200px] md:min-w-[300px]">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t("nav.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="w-full pl-8 sm:pl-10 pr-4 sm:pr-6 py-2 sm:py-3 bg-gray-200 rounded text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200"
            />
            <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400"
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
            className="text-white px-4 sm:px-6 py-2 sm:py-3 rounded ml-2 sm:ml-3 transition-colors-transform duration-200 hover:scale-105 bg-[#ee6786] hover:opacity-80 active:bg-[#d45573]"
          >
            {t("nav.search")}
          </button>
        </div>) : (
 
  <div className="flex-auto mx-1 sm:mx-2 md:mx-3 min-w-[200px] md:min-w-[300px]" />)}

        {/* Language switcher */}
        <div className="flex items-center ml-2 sm:ml-4 md:ml-6 text-black gap-0">
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
        <div className="relative ml-2 sm:ml-4 md:ml-6 lg:ml-10 min-w-[180px] md:min-w-[220px] flex justify-left">
          {isLoggedIn ?  (
            <div className="flex items-center gap-4 sm:gap-5 md:gap-7">
              {!isProfilePage && (<Link
                to="/profile"
                className="flex items-center text-gray-600 p-2 cursor-pointer hover:text-red-600 transition-colors duration-200 hover:bg-gray-100"
                style={{ backgroundColor: "transparent" }}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 rounded-full flex items-center justify-center mr-1 sm:mr-2">
                  <span className="text-xs sm:text-xs font-medium text-gray-600">
                    {(() => {
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
                    })()}
                  </span>
                </div>
                <span className="font-medium">
                  {(() => {
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
                  })()}
                </span>
              </Link>)}
              <button
                onClick={handleSignout}
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
            </button>)
          )}
        </div>
      </div>
      </div>

      {/* Modals */}
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
        onLogin={handleLogin} // call with username inside SignIn submit
      />
      <ForgotPassword
        isOpen={showForgotPassword}
        onClose={closeModals}
        onSwitchToSignIn={handleSignInClick}
        onSwitchToSignUp={handleSignUpClick}
      />
    </>
  );
}

export default Navbar;
