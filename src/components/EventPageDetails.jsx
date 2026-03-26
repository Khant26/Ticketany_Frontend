import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import OrderForm from "./OrderForm";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import apiService from "../services/apiService";
import { AUTH_REQUIRED_EVENT, ensureValidSession } from "../services/apiClient";

function EventPageDetails() {
  const { t } = useTranslation();
  let { id } = useParams();
  const touchStartXRef = useRef(null);
  const touchDeltaXRef = useRef(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageFading, setIsImageFading] = useState(false);
  const fadeTimeoutRef = useRef(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const accessToken = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user_data");
    return !!(accessToken && userData);
  });

  const [eventDetails, setEventDetails] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await apiService.get("events/", { auth: false });
        setEventDetails(data);

        if (data.length > 0) {
          const targetEvent =
            data.find((event) => event.id === parseInt(id)) || data[0];
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, [id]);

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateLoginState = () => {
      const accessToken = localStorage.getItem("access_token");
      const userData = localStorage.getItem("user_data");
      const newLoggedInState = !!(accessToken && userData);
      setIsLoggedIn(newLoggedInState);
    };

    const handleAuthRequired = () => {
      setIsLoggedIn(false);
      setShowOrderForm(false);
      setShowSignUp(false);
      setShowSignIn(false);
    };

    window.addEventListener("userLoginChanged", updateLoginState);
    window.addEventListener("storage", updateLoginState);
    window.addEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);

    return () => {
      window.removeEventListener("userLoginChanged", updateLoginState);
      window.removeEventListener("storage", updateLoginState);
      window.removeEventListener(AUTH_REQUIRED_EVENT, handleAuthRequired);
    };
  }, []);

  useEffect(() => {
      const navbar = document.querySelector(".navbar");

      if (navbar) {
        if (isFullscreenOpen) {
          navbar.style.opacity = "0";
          navbar.style.pointerEvents = "none";
        } else {
          navbar.style.opacity = "1";
          navbar.style.pointerEvents = "auto";
        }
      }

      return () => {
        if (navbar) {
          navbar.style.opacity = "1";
          navbar.style.pointerEvents = "auto";
        }
      };
    }, [isFullscreenOpen]);

  const eventDetail =
    eventDetails.find((event) => event.id === parseInt(id)) || eventDetails[0];
  if (eventDetails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 border-[3px] sm:border-4 border-pink-200 border-t-[#f28fa5]"></div>

        <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-600">
          Loading event details...
        </p>
      </div>
    );
  }

  if (id && !eventDetail) {
    return (
      <div className="mt-16 lg:mb-10 lg:px-100 md:mt-24 px-4 md:px-8 py-6 text-center">
        <div className="text-red-600 text-xl font-bold">
          {t("generic.noEvent")}
        </div>
        <p className="text-gray-600 mt-2">Event with ID {id} not found</p>
      </div>
    );
  }

  const formatEventDates = (dateData) => {
    if (!dateData) return "TBD";

    try {
      let dates = dateData;
      if (typeof dateData === "string") {
        try {
          const parsed = JSON.parse(dateData);
          if (Array.isArray(parsed)) {
            dates = parsed;
          }
        } catch {
          dates = dateData;
        }
      }

      if (Array.isArray(dates)) {
        return dates.join(", ");
      }

      return String(dates);
    } catch (error) {
      return String(dateData);
    }
  };

  const formatTicketPrices = (priceData) => {
    if (!priceData) return "TBD";

    try {
      let prices = priceData;

      if (typeof priceData === "string") {
        try {
          const parsed = JSON.parse(priceData);
          if (Array.isArray(parsed)) {
            prices = parsed;
          }
        } catch {
          prices = priceData;
        }
      }

      if (Array.isArray(prices)) {
        return prices.join(", ");
      }

      if (typeof prices === "number") {
        return String(prices);
      }

      if (typeof prices === "object") {
        return Object.entries(prices)
          .map(
            ([tier, price]) =>
              `${tier.charAt(0).toUpperCase() + tier.slice(1)}: ${price}`,
          )
          .join(", ");
      }

      return String(prices);
    } catch (error) {
      return String(priceData);
    }
  };

  const getEventImages = (event) => {
    if (event?.images?.length > 0) {
      return event.images.map((img) => img.image_url).filter(Boolean);
    }

    if (event.event_image && typeof event.event_image === "string") {
      if (event.event_image.includes("|||SEPARATOR|||")) {
        const images = event.event_image
          .split("|||SEPARATOR|||") 
          .filter(Boolean);

        return images;
      } else {
        return [event.event_image];
      }
    }

    if (event.event_images && Array.isArray(event.event_images)) {
      const processedImages = event.event_images
        .map((img, index) => {
          if (typeof img === "string") return img;
          return img.data || img.image || img.url || img;
        })
        .filter(Boolean);

      return processedImages;
    }

    return [];
  };

  const images = eventDetail ? getEventImages(eventDetail) : [];

  const goToImage = (nextIndex) => {
    if (!images.length) return;
    if (nextIndex === currentImageIndex) return;

    setIsImageFading(true);
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    fadeTimeoutRef.current = setTimeout(() => {
      setCurrentImageIndex(nextIndex);
    }, 80);
  };

  const nextImage = () => {
    const nextIndex =
      currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
    goToImage(nextIndex);
  };

  const prevImage = () => {
    const nextIndex =
      currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    goToImage(nextIndex);
  };

  const handleTouchStart = (e) => {
    if (images.length <= 1) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (e) => {
    if (touchStartXRef.current === null) return;
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null) return;

    const swipeThreshold = 50;

    if (touchDeltaXRef.current <= -swipeThreshold) {
      nextImage();
    } else if (touchDeltaXRef.current >= swipeThreshold) {
      prevImage();
    }

    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
  };

  const isUserLoggedIn = () => {
    return isLoggedIn;
  };

  const handleOrderNowClick = async () => {
    if (!isUserLoggedIn()) {
      setShowSignIn(true);
      return;
    }

    const isValid = await ensureValidSession({ notify: true });
    if (!isValid) {
      setShowOrderForm(false);
      return;
    }

    setShowOrderForm(true);
  };

  return (
    <>
      <div className="flex flex-col items-center min-h-screen bg-gray-50">
        <div className="mt-16 md:mt-24 px-4 md:px-8 py-6 relative z-10 w-full">
          <div className="max-w-[1360px] mx-auto pt-0 flex flex-col lg:flex-row">
            {/* Left column - Event Detail */}
            <div className="w-full lg:w-2/3 bg-white shadow-md rounded-xl pb-4 sm:pb-6 md:pb-8 flex flex-col overflow-hidden">
              <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
                {/* Image Section */}
                <div className="w-full">
                  {images.length > 0 ? (
                    <div
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <img
                        src={images[currentImageIndex]}
                        alt={`${eventDetail?.event_name || "Event"} - Image ${currentImageIndex + 1}`}
                        className={`w-full h-52 sm:h-64 md:h-80 lg:h-[420px] xl:h-[480px] object-cover rounded-t-xl transition-opacity duration-150 ease-out cursor-pointer ${
                          isImageFading ? "opacity-80" : "opacity-100"
                        }`}
                        onClick={() => setIsFullscreenOpen(true)}
                        onLoad={() => setIsImageFading(false)}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-52 sm:h-64 md:h-80 lg:h-[420px] xl:h-[480px] bg-gray-200 flex items-center justify-center rounded-t-xl">
                      <span className="text-sm sm:text-base text-gray-500">
                        No Image Available
                      </span>
                    </div>
                  )}

                  {images.length > 1 && (
                    <div className="mt-3 sm:mt-4 flex items-center justify-center gap-3 sm:gap-5 px-3">
                      <button
                        onClick={prevImage}
                        className="p-1.5 sm:p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>

                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToImage(index)}
                            className="p-0 m-0 focus:outline-none"
                          >
                            <span
                              className={`block rounded-full transition-all duration-200 ${
                                currentImageIndex === index
                                  ? "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#f28fa5] scale-110 shadow-[0_0_0_3px_rgba(242,143,165,0.4)]"
                                  : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-black/50 hover:bg-black/70"
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={nextImage}
                        className="p-1.5 sm:p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                {/* Fullscreen modal at very end */}
                {isFullscreenOpen && images.length > 0 && (
                  <div
                    className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setIsFullscreenOpen(false)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <button
                      onClick={() => setIsFullscreenOpen(false)}
                      className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors z-[100000]"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    <img
                      src={images[currentImageIndex]}
                      alt={`${eventDetail?.event_name || "Event"} - Fullscreen`}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                {/* Detail Section */}
                <div className="w-full flex flex-col justify-between px-4 sm:px-5 md:px-6 pt-2 sm:pt-4 cursor-default">
                  <h3 className="text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold lg:font-semibold text-gray-800 mb-4 sm:mb-6 md:mb-8 leading-snug break-words">
                    {eventDetail?.event_name || "Event Details"}
                  </h3>

                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Date */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-5">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          {t("event.date")}
                        </p>
                        <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 break-words">
                          {formatEventDates(eventDetail?.event_date)}
                        </p>
                      </div>

                      {/* Time */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-5">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          {t("event.time")}
                        </p>
                        <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 break-words">
                          {eventDetail?.event_time || "TBD"}
                        </p>
                      </div>

                      {/* Location */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-5">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          {t("event.location")}
                        </p>
                        <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 break-words whitespace-normal">
                          {eventDetail?.event_location || "TBD"}
                        </p>
                      </div>

                      {/* Sale Date */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-5">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          {t("event.sale")}
                        </p>
                        <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 break-words">
                          {eventDetail?.sale_date || "TBD"}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-5 sm:col-span-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                          {t("event.price")}
                        </p>
                        <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 break-words whitespace-normal">
                          {formatTicketPrices(eventDetail?.ticket_price)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleOrderNowClick}
                    className="w-full sm:w-2/3 md:w-1/2 lg:w-2/5 xl:w-1/3 mx-auto px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg text-white rounded-lg hover:opacity-90 hover:scale-105 transition-all duration-200 font-bold bg-[#e05680] active:bg-[#e05680] cursor-pointer shadow-md"
                  >
                    {t("event.orderNow")}
                  </button>
                </div>
              </div>
            </div>

            {/* Right column - How to Order */}
            <div className="cursor-default w-full lg:w-1/3 bg-white shadow-md rounded-lg p-5 sm:p-6 lg:p-5 xl:p-6 min-h-[400px] lg:min-h-[500px] mt-6 lg:mt-0">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4">
                How to Order
              </h3>
            </div>
          </div>
        </div>
      </div>

      <OrderForm
        isOpen={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        eventTitle={eventDetail?.event_name || "Event"}
        eventDates={eventDetail?.event_date || "TBD"}
        eventTime={eventDetail?.event_time || "TBD"}
        eventLocation={eventDetail?.event_location || "TBD"}
        eventImage={images?.length > 0 ? images[0] : null}
        eventPrices={eventDetail?.ticket_price || "TBD"}
        eventId={eventDetail?.id}
      />

      <SignIn
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => {
          setShowSignIn(false);
          setShowSignUp(true);
        }}
        onSwitchToForgotPassword={() => {}}
        onLogin={() => {
          setIsLoggedIn(true);
          setShowSignIn(false);
          setShowOrderForm(true);
        }}
      />

      <SignUp
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => {
          setShowSignUp(false);
          setShowSignIn(true);
        }}
      />
    </>
  );
}

export default EventPageDetails;
