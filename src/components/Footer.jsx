import Logo from "../assets/logo.jpg";
import {
  FaFacebookF,
  FaInstagram,
  FaTelegramPlane,
  FaFacebookMessenger,
} from "react-icons/fa";

function Footer() {
  return (
    <footer
      role="contentinfo"
      className=" bg-white border-t border-gray-300 shadow-lg pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto max-w-7xl px-12 sm:px-14">
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-x-4 gap-y-2 py-2 sm:py-3">
          <div className="flex items-center gap-3">
            <img
              src={Logo}
              alt="Tickets Anywhere logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-black text-base sm:text-lg cursor-default">
              Tickets Anywhere
            </span>
          </div>

          <div className="flex items-center gap-4 order-last sm:order-none">
            <a
              href="https://www.facebook.com/profile.php?id=100088835078200"
              target="_blank"
              className=" hover:text-[#f28fa5] transition transform hover:scale-125"
            >
              <FaFacebookF className="w-6 h-6" />
            </a>

            <a
              href="https://www.facebook.com/messages/t/115097331446124"
              target="_blank"
              className="hover:text-[#f28fa5] transition transform hover:scale-125"
            >
              <FaFacebookMessenger className="w-6 h-6" />
            </a>

            <a
              href="https://www.instagram.com/tickets_anywhere/"
              target="_blank"
              className=" hover:text-[#f28fa5] transition transform hover:scale-125 "
            >
              <FaInstagram className="w-7 h-7" />
            </a>

            <a
              href="https://t.me/ticketanywhereSnB"
              target="_blank"
              className=" hover:text-[#f28fa5] transition transform hover:scale-125"
            >
              <FaTelegramPlane className="w-7 h-7" />
            </a>
          </div>

          <span className="text-gray-700 text-xs sm:text-sm text-center cursor-default">
            Made by HybridDev. © 2025
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
